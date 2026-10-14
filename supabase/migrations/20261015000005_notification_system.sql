-- CityPulse Migration 005: Server-Side Notification System
-- 1. Add notification_type enum and column for deduplication
-- 2. Add unique idempotency constraint (user_id + report_id + notification_type)
-- 3. Haversine distance function for geographic matching
-- 4. Server-side function to generate nearby notifications on report INSERT
-- 5. Trigger on reports table to invoke notification generation

-- =========================================================================
-- 1. Notification type enum
-- =========================================================================
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'nearby_alert',
    'status_update',
    'verification_milestone'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add notification_type column to existing notifications table
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS notification_type notification_type NOT NULL DEFAULT 'nearby_alert';

-- =========================================================================
-- 2. Idempotency constraint: one notification per (user, report, type)
-- =========================================================================
-- Prevents duplicate notifications on trigger retries or re-runs
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS uq_notification_idempotency;

ALTER TABLE public.notifications
  ADD CONSTRAINT uq_notification_idempotency
  UNIQUE (user_id, report_id, notification_type);

-- Additional index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

-- =========================================================================
-- 3. Haversine distance function (returns meters)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.haversine_meters(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  R DOUBLE PRECISION := 6371000; -- Earth radius in meters
  phi1 DOUBLE PRECISION;
  phi2 DOUBLE PRECISION;
  delta_phi DOUBLE PRECISION;
  delta_lambda DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  phi1 := radians(lat1);
  phi2 := radians(lat2);
  delta_phi := radians(lat2 - lat1);
  delta_lambda := radians(lon2 - lon1);

  a := sin(delta_phi / 2) * sin(delta_phi / 2)
     + cos(phi1) * cos(phi2) * sin(delta_lambda / 2) * sin(delta_lambda / 2);
  c := 2 * atan2(sqrt(a), sqrt(1 - a));

  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =========================================================================
-- 4. Server-side notification generator
-- Runs as SECURITY DEFINER (database owner) — bypasses RLS to insert
-- notifications for multiple users. The client never calls this directly.
--
-- MATCHING RULES:
--   1. User must have in_app_enabled = true in alert preferences
--   2. If high_severity_only = true, only match High severity reports
--   3. Report category must be in user's enabled_categories array
--   4. At least one saved_alert_location must be within its configured radius
--   5. Report author is EXCLUDED (no self-notifications)
--   6. Idempotency: ON CONFLICT DO NOTHING prevents duplicates
-- =========================================================================
CREATE OR REPLACE FUNCTION public.generate_nearby_notifications(
  p_report_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_report public.reports%ROWTYPE;
  v_count INTEGER := 0;
  v_distance DOUBLE PRECISION;
  v_title TEXT;
  v_message TEXT;
  rec RECORD;
BEGIN
  -- Fetch the new report
  SELECT * INTO v_report FROM public.reports WHERE id = p_report_id;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Build human-readable notification content
  v_title := v_report.type::TEXT || ' reported nearby';
  v_message := v_report.type::TEXT || ' at ' || v_report.location_label
    || ' — ' || v_report.severity::TEXT || ' severity. Tap to view details.';

  -- Find all matching users via their saved alert locations
  FOR rec IN
    SELECT DISTINCT ON (sal.user_id)
      sal.user_id,
      sal.label AS location_label,
      public.haversine_meters(
        v_report.latitude, v_report.longitude,
        sal.latitude, sal.longitude
      ) AS dist_meters
    FROM public.saved_alert_locations sal
    JOIN public.user_alert_preferences uap ON uap.user_id = sal.user_id
    WHERE
      -- Must have in-app notifications enabled
      uap.in_app_enabled = true
      -- Category must be in user's enabled list
      AND v_report.category = ANY(uap.enabled_categories)
      -- If high_severity_only, only match High
      AND (uap.high_severity_only = false OR v_report.severity = 'High')
      -- Exclude the report's own author
      AND (v_report.user_id IS NULL OR sal.user_id != v_report.user_id)
      -- Distance check: use the per-location radius (not global preference)
      AND public.haversine_meters(
        v_report.latitude, v_report.longitude,
        sal.latitude, sal.longitude
      ) <= sal.radius_meters
    ORDER BY sal.user_id, dist_meters ASC
  LOOP
    -- Insert notification with idempotency guard
    INSERT INTO public.notifications (
      user_id,
      report_id,
      notification_type,
      title,
      message,
      is_read
    )
    VALUES (
      rec.user_id,
      p_report_id,
      'nearby_alert',
      v_title,
      v_message,
      false
    )
    ON CONFLICT ON CONSTRAINT uq_notification_idempotency DO NOTHING;

    -- Count only actually inserted rows
    IF FOUND THEN
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 5. Trigger: auto-generate nearby notifications on every new report
-- =========================================================================
CREATE OR REPLACE FUNCTION public.trigger_notify_nearby_users()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.generate_nearby_notifications(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_report_created_notify ON public.reports;
CREATE TRIGGER on_report_created_notify
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notify_nearby_users();

-- =========================================================================
-- 6. RLS: Allow the SECURITY DEFINER functions to insert notifications
-- The existing RLS policies only allow users to read/update their own.
-- We need no INSERT policy for regular users — only server-side functions
-- (running as SECURITY DEFINER, which bypasses RLS) can create notifications.
-- This prevents any client from fabricating notifications for other users.
-- =========================================================================

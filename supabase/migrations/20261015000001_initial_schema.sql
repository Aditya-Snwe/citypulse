-- CityPulse Migration 001: Initial Schema
-- Sets up core enums, profiles, reports, report votes, notifications, user preferences, and browser push subscriptions

-- 1. Create custom enum types matching CityPulse frontend domain
DO $$ BEGIN
  CREATE TYPE issue_type AS ENUM (
    'Pothole',
    'Road Damage',
    'Garbage',
    'Water Leakage',
    'Waterlogging',
    'Broken Streetlight',
    'Fallen Tree',
    'Other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE issue_category AS ENUM (
    'Road Infrastructure',
    'Waste',
    'Water',
    'Electricity',
    'Other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE severity_level AS ENUM ('Low', 'Medium', 'High');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM (
    'Submitted',
    'In Progress',
    'Community Confirmed',
    'Community Monitoring',
    'Resolved'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vote_type AS ENUM ('present', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Citizen',
  area_label TEXT DEFAULT 'Nashik',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT role_check CHECK (role IN ('citizen', 'moderator', 'admin'))
);

-- 3. Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type issue_type NOT NULL,
  category issue_category NOT NULL,
  description TEXT NOT NULL,
  location_label TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  severity severity_level NOT NULL DEFAULT 'Low',
  status report_status NOT NULL DEFAULT 'Submitted',
  confirmations INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  timeline JSONB NOT NULL DEFAULT '[
    {"label": "Report submitted", "done": true},
    {"label": "Location recorded", "done": true},
    {"label": "Community verification started", "done": false, "active": true},
    {"label": "Community monitoring", "done": false}
  ]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial and filter indexes on reports
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports (category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports (user_id);

-- 4. Report verification votes table
CREATE TABLE IF NOT EXISTS public.report_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote vote_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_report_user_vote UNIQUE(report_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_report_id ON public.report_votes (report_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.report_votes (user_id);

-- 5. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read, created_at DESC);

-- 6. User alert preferences
CREATE TABLE IF NOT EXISTS public.user_alert_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  radius_meters INTEGER NOT NULL DEFAULT 3000,
  high_severity_only BOOLEAN NOT NULL DEFAULT false,
  enabled_categories issue_category[] NOT NULL DEFAULT '{
    "Road Infrastructure",
    "Waste",
    "Water",
    "Electricity",
    "Other"
  }'::issue_category[],
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_radius CHECK (radius_meters >= 100 AND radius_meters <= 50000)
);

-- 7. Saved alert locations (e.g. Home, Office, Parents)
CREATE TABLE IF NOT EXISTS public.saved_alert_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 2000,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_locations_user ON public.saved_alert_locations (user_id);

-- 8. Browser push subscriptions (Web Push standard)
CREATE TABLE IF NOT EXISTS public.browser_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_push_endpoint UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_user_id ON public.browser_push_subscriptions (user_id);

-- 9. Automatic profile and alert preferences creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, area_label, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Citizen'),
    COALESCE(new.raw_user_meta_data->>'area_label', 'Nashik'),
    new.raw_user_meta_data->>'avatar_url',
    'citizen'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_alert_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Atomic vote procedure
CREATE OR REPLACE FUNCTION public.record_report_vote(
  p_report_id UUID,
  p_vote vote_type
)
RETURNS TABLE (
  report_id UUID,
  new_confirmations INTEGER,
  user_vote vote_type
) AS $$
DECLARE
  v_user_id UUID;
  v_previous_vote vote_type;
  v_delta INTEGER := 0;
  v_total INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT vote INTO v_previous_vote
  FROM public.report_votes
  WHERE report_votes.report_id = p_report_id AND report_votes.user_id = v_user_id;

  IF v_previous_vote IS NULL THEN
    IF p_vote = 'present' THEN
      v_delta := 1;
    END IF;
    INSERT INTO public.report_votes (report_id, user_id, vote)
    VALUES (p_report_id, v_user_id, p_vote);
  ELSE
    IF v_previous_vote != p_vote THEN
      IF p_vote = 'present' THEN
        v_delta := 1;
      ELSIF v_previous_vote = 'present' THEN
        v_delta := -1;
      END IF;
      UPDATE public.report_votes
      SET vote = p_vote
      WHERE report_votes.report_id = p_report_id AND report_votes.user_id = v_user_id;
    END IF;
  END IF;

  IF v_delta != 0 THEN
    UPDATE public.reports
    SET confirmations = GREATEST(1, confirmations + v_delta),
        updated_at = now()
    WHERE id = p_report_id
    RETURNING confirmations INTO v_total;
  ELSE
    SELECT confirmations INTO v_total FROM public.reports WHERE id = p_report_id;
  END IF;

  RETURN QUERY SELECT p_report_id, v_total, p_vote;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

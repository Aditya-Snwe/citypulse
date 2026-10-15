-- =========================================================================
-- CityPulse Migration 006: Web Push Subscription Queries & Dispatch Helper
-- =========================================================================

-- Function to securely query push subscriptions for users matching a report's
-- location and alert preferences (push_enabled = true).
-- SECURITY DEFINER allows the Edge Function or backend service to fetch
-- eligible endpoints without exposing them to public clients.

CREATE OR REPLACE FUNCTION public.get_eligible_push_subscriptions(
  p_report_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  endpoint TEXT,
  p256dh TEXT,
  auth_key TEXT
) AS $$
DECLARE
  v_report public.reports%ROWTYPE;
BEGIN
  -- 1. Fetch report details
  SELECT * INTO v_report FROM public.reports WHERE reports.id = p_report_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- 2. Return subscriptions belonging to users who:
  --    - Have push_enabled = true in user_alert_preferences
  --    - Have enabled the report's category
  --    - Match severity preferences
  --    - Are NOT the author of the report
  --    - Have a saved_alert_location within its configured radius
  RETURN QUERY
  SELECT DISTINCT ON (bps.endpoint)
    bps.id,
    bps.user_id,
    bps.endpoint,
    bps.p256dh,
    bps.auth_key
  FROM public.browser_push_subscriptions bps
  JOIN public.user_alert_preferences uap ON uap.user_id = bps.user_id
  JOIN public.saved_alert_locations sal ON sal.user_id = bps.user_id
  WHERE
    uap.push_enabled = true
    AND v_report.category = ANY(uap.enabled_categories)
    AND (uap.high_severity_only = false OR v_report.severity = 'High')
    AND (v_report.user_id IS NULL OR bps.user_id != v_report.user_id)
    AND public.haversine_meters(
      v_report.latitude, v_report.longitude,
      sal.latitude, sal.longitude
    ) <= sal.radius_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

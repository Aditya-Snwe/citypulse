-- CityPulse Migration 002: Row Level Security (RLS) Policies
-- Enforces zero-trust permissions, prevents role escalation, protects civic reports and user data

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_alert_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.browser_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 1. Profiles Policies
-- =========================================================================
-- Anyone can view citizen profiles (public civic display)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can only update their own profile, but CANNOT modify their own role
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- =========================================================================
-- 2. Reports Policies
-- =========================================================================
-- Public report reading: all citizens (including unauthenticated visitors) can view civic reports
CREATE POLICY "Civic reports are viewable by everyone"
  ON public.reports FOR SELECT
  USING (true);

-- Authenticated users can insert reports with themselves as user_id and default status 'Submitted'
CREATE POLICY "Authenticated users can submit reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    status = 'Submitted' AND
    confirmations = 1
  );

-- Authorized owners can edit description and image only while report is still 'Submitted'
-- Citizens cannot arbitrarily mark reports 'Resolved' or change official status
CREATE POLICY "Owners can update their pending reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'Submitted')
  WITH CHECK (
    auth.uid() = user_id AND
    status = 'Submitted'
  );

-- =========================================================================
-- 3. Report Verification Votes Policies
-- =========================================================================
-- Votes are visible to everyone for verification tallies
CREATE POLICY "Votes are viewable by everyone"
  ON public.report_votes FOR SELECT
  USING (true);

-- Authenticated users can cast their own vote
CREATE POLICY "Authenticated users can cast votes"
  ON public.report_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can change their own vote
CREATE POLICY "Users can update their own vote"
  ON public.report_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 4. Notifications Policies
-- =========================================================================
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 5. User Alert Preferences Policies
-- =========================================================================
-- Users can view their own alert preferences
CREATE POLICY "Users can view own alert preferences"
  ON public.user_alert_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own alert preferences
CREATE POLICY "Users can insert own alert preferences"
  ON public.user_alert_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own alert preferences
CREATE POLICY "Users can update own alert preferences"
  ON public.user_alert_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 6. Saved Alert Locations Policies
-- =========================================================================
-- Users can manage their own saved alert locations
CREATE POLICY "Users can view own saved locations"
  ON public.saved_alert_locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved locations"
  ON public.saved_alert_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved locations"
  ON public.saved_alert_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved locations"
  ON public.saved_alert_locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================================
-- 7. Browser Push Subscriptions Policies
-- =========================================================================
-- Users can manage their own browser push subscriptions
CREATE POLICY "Users can view own push subscriptions"
  ON public.browser_push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register own push subscription"
  ON public.browser_push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscription"
  ON public.browser_push_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscription"
  ON public.browser_push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

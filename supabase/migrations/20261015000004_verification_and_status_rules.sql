-- CityPulse Migration 004: Persistent Community Verification & Status Transitions
-- 1. Extend report_votes and reports schema
-- 2. Add status-transition and timeline logging rules

-- Alter reports to track positive confirmations and negative resolution feedback separately
ALTER TABLE public.reports 
  ADD COLUMN IF NOT EXISTS positive_votes INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS negative_votes INTEGER NOT NULL DEFAULT 0;

-- Backfill positive_votes from confirmations if needed
UPDATE public.reports
SET positive_votes = confirmations
WHERE positive_votes = 1 AND confirmations > 1;

-- Enhanced atomic vote procedure with status-transition rules
-- STATUS RULES & THRESHOLDS:
-- 1. Status 'Submitted': Base initial status when reported.
-- 2. Status 'Community Confirmed': When positive_votes >= 3 and report is still 'Submitted'.
-- 3. Status 'Community Monitoring': When negative_votes >= 3, or report is flagged with conflicting feedback.
--    NOTE: A single negative vote NEVER marks a report as 'Resolved'.
-- 4. Status 'Resolved': Can ONLY be set by:
--    a) Authorized municipal moderator/admin, OR
--    b) Verified report owner confirming fix, OR
--    c) Strict consensus threshold: at least 5 resolved votes with a 75%+ consensus ratio (negative_votes >= 5 AND negative_votes >= positive_votes * 3).
CREATE OR REPLACE FUNCTION public.record_report_vote(
  p_report_id UUID,
  p_vote vote_type
)
RETURNS TABLE (
  report_id UUID,
  new_confirmations INTEGER,
  new_positive_votes INTEGER,
  new_negative_votes INTEGER,
  new_status report_status,
  user_vote vote_type
) AS $$
DECLARE
  v_user_id UUID;
  v_previous_vote vote_type;
  v_report public.reports%ROWTYPE;
  v_pos_delta INTEGER := 0;
  v_neg_delta INTEGER := 0;
  v_new_status report_status;
  v_timeline JSONB;
  v_status_changed BOOLEAN := false;
  v_timeline_entry JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock report row for safe simultaneous vote processing
  SELECT * INTO v_report
  FROM public.reports
  WHERE id = p_report_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report not found';
  END IF;

  -- Check existing vote by this user on this report
  SELECT vote INTO v_previous_vote
  FROM public.report_votes
  WHERE report_votes.report_id = p_report_id AND report_votes.user_id = v_user_id;

  IF v_previous_vote IS NULL THEN
    -- Brand new vote
    IF p_vote = 'present' THEN
      v_pos_delta := 1;
    ELSE
      v_neg_delta := 1;
    END IF;

    INSERT INTO public.report_votes (report_id, user_id, vote)
    VALUES (p_report_id, v_user_id, p_vote);
  ELSE
    -- Changing previous vote
    IF v_previous_vote != p_vote THEN
      IF p_vote = 'present' THEN
        v_pos_delta := 1;
        v_neg_delta := -1;
      ELSE
        v_pos_delta := -1;
        v_neg_delta := 1;
      END IF;

      UPDATE public.report_votes
      SET vote = p_vote, created_at = now()
      WHERE report_votes.report_id = p_report_id AND report_votes.user_id = v_user_id;
    END IF;
  END IF;

  -- Apply counts
  v_report.positive_votes := GREATEST(1, v_report.positive_votes + v_pos_delta);
  v_report.negative_votes := GREATEST(0, v_report.negative_votes + v_neg_delta);
  v_report.confirmations := v_report.positive_votes;

  -- Evaluate transparent status transition rules
  v_new_status := v_report.status;
  v_timeline := v_report.timeline;

  IF v_report.status = 'Submitted' AND v_report.positive_votes >= 3 THEN
    v_new_status := 'Community Confirmed';
    v_status_changed := true;
    v_timeline_entry := jsonb_build_object(
      'label', 'Community Confirmed (3+ verified citizen votes)',
      'done', true,
      'active', true,
      'timestamp', now(),
      'actor', 'community'
    );
  ELSIF v_report.status = 'Community Confirmed' AND v_report.negative_votes >= 3 AND v_report.status != 'Resolved' THEN
    v_new_status := 'Community Monitoring';
    v_status_changed := true;
    v_timeline_entry := jsonb_build_object(
      'label', 'Community Monitoring (Resolution feedback reported)',
      'done', true,
      'active', true,
      'timestamp', now(),
      'actor', 'community'
    );
  ELSIF v_report.negative_votes >= 5 AND v_report.negative_votes >= (v_report.positive_votes * 3) AND v_report.status != 'Resolved' THEN
    v_new_status := 'Resolved';
    v_status_changed := true;
    v_timeline_entry := jsonb_build_object(
      'label', 'Community Consensus Resolved (Overwhelming citizen consensus)',
      'done', true,
      'timestamp', now(),
      'actor', 'community'
    );
  END IF;

  -- Append to timeline if status transitioned
  IF v_status_changed THEN
    v_timeline := v_timeline || jsonb_build_array(v_timeline_entry);
  END IF;

  -- Update report
  UPDATE public.reports
  SET positive_votes = v_report.positive_votes,
      negative_votes = v_report.negative_votes,
      confirmations = v_report.confirmations,
      status = v_new_status,
      timeline = v_timeline,
      updated_at = now()
  WHERE id = p_report_id;

  RETURN QUERY SELECT 
    p_report_id, 
    v_report.confirmations, 
    v_report.positive_votes, 
    v_report.negative_votes, 
    v_new_status, 
    p_vote;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

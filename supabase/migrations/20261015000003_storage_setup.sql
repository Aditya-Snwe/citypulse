-- CityPulse Migration 003: Storage Bucket Configuration
-- Configures the 'report-evidence' storage bucket for photos and sets up security policies

-- 1. Create storage bucket if not already existing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-evidence',
  'report-evidence',
  true, -- Safe public CDN read for civic awareness map/cards
  5242880, -- 5MB maximum limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

-- 2. Storage RLS Policies
CREATE POLICY "Public read for report evidence photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-evidence');

-- Only authenticated users can upload report photos, restricted into their own folder (user_id/filename)
CREATE POLICY "Authenticated users can upload report photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'report-evidence' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own uploaded photos
CREATE POLICY "Users can delete own uploaded photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'report-evidence' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

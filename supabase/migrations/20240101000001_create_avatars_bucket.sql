-- Create storage bucket for avatars
-- This bucket stores user avatar images with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can upload their own avatar
-- Users can only upload files to their own folder (identified by user ID)
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can update their own avatar
-- Users can only update files in their own folder
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Anyone can view avatars
-- Public read access for all avatar images
CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- RLS Policy: Users can delete their own avatar
-- Users can only delete files in their own folder
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


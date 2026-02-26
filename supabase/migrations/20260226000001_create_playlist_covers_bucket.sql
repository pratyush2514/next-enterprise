-- Create storage bucket for playlist cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('playlist-covers', 'playlist-covers', true);

-- RLS Policy: Users can upload playlist covers to their own folder
CREATE POLICY "Users can upload playlist covers"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'playlist-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can update their own playlist covers
CREATE POLICY "Users can update playlist covers"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'playlist-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Anyone can view playlist covers
CREATE POLICY "Anyone can view playlist covers"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'playlist-covers');

-- RLS Policy: Users can delete their own playlist covers
CREATE POLICY "Users can delete playlist covers"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'playlist-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

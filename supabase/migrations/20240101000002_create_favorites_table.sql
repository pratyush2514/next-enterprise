-- Create favorites table for storing user track favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id INTEGER NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artwork_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each user can only favorite a track once
  UNIQUE (user_id, track_id)
);

-- Indexes for performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_user_track ON favorites(user_id, track_id);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own favorites
CREATE POLICY "Users can read own favorites"
  ON favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites
  FOR DELETE
  USING (auth.uid() = user_id);

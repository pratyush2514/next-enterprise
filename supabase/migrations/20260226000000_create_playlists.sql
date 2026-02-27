-- Create playlists table for user-curated song collections
CREATE TABLE public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Playlist',
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create playlist_songs join table
CREATE TABLE public.playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id INTEGER NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artwork_url TEXT NOT NULL DEFAULT '',
  preview_url TEXT NOT NULL DEFAULT '',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each song can only appear once in a playlist
  UNIQUE(playlist_id, track_id)
);

-- Indexes for performance
CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_position ON public.playlist_songs(playlist_id, position);

-- Enable Row Level Security
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Playlists RLS: Users can only access their own playlists
CREATE POLICY "Users can view own playlists"
  ON public.playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playlists"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);

-- Playlist songs RLS: Ownership checked via playlist join
CREATE POLICY "Users can view songs in own playlists"
  ON public.playlist_songs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can add songs to own playlists"
  ON public.playlist_songs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can update songs in own playlists"
  ON public.playlist_songs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove songs from own playlists"
  ON public.playlist_songs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  ));

-- Reuse existing handle_updated_at() function from profiles migration
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

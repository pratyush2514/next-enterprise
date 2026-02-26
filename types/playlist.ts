/** Application-level playlist types (camelCase, decoupled from DB snake_case) */

export interface Playlist {
  id: string
  userId: string
  name: string
  coverUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface PlaylistSong {
  id: string
  playlistId: string
  trackId: number
  trackName: string
  artistName: string
  artworkUrl: string
  previewUrl: string
  durationMs: number
  position: number
  addedAt: string
}

/** Used when adding a song to a playlist from an ITunesResult or QueueTrack */
export interface PlaylistSongInput {
  trackId: number
  trackName: string
  artistName: string
  artworkUrl: string
  previewUrl: string
  durationMs: number
}

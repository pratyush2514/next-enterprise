"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { DeletePlaylistDialog } from "components/Songs/DeletePlaylistDialog"
import { PlaylistHeader } from "components/Songs/PlaylistHeader"
import { PlaylistRecommended } from "components/Songs/PlaylistRecommended"
import { PlaylistSongList } from "components/Songs/PlaylistSongList"
import { useUpdatePlaybackTrack } from "components/Songs/SongsShell"
import { type QueueTrack, useAudioPreview } from "hooks/useAudioPreview"
import { usePlaylists } from "hooks/usePlaylists"
import { PlaylistSongsProvider, usePlaylistSongs } from "hooks/usePlaylistSongs"
import { Link, useRouter } from "i18n/navigation"

export default function PlaylistPage() {
  const params = useParams<{ id: string }>()
  const { playlists, isLoading: playlistsLoading } = usePlaylists()
  const playlist = playlists.find((p) => p.id === params.id)

  if (playlistsLoading) {
    return <PlaylistSkeleton />
  }

  if (!playlist) {
    return <PlaylistNotFound />
  }

  return (
    <PlaylistSongsProvider playlistId={params.id}>
      <PlaylistPageContent />
    </PlaylistSongsProvider>
  )
}

function PlaylistSkeleton() {
  return (
    <div className="px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div className="size-40 animate-pulse self-center rounded-xl bg-gray-200 sm:size-48 sm:self-auto dark:bg-white/10" />
        <div className="flex flex-1 flex-col items-center space-y-3 sm:items-start">
          <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-11 w-36 animate-pulse rounded-full bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  )
}

function PlaylistNotFound() {
  const t = useTranslations("songs.playlistPage")
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-16">
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{t("notFound")}</h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">{t("notFoundHint")}</p>
      <Link
        href="/song"
        className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
      >
        {t("goHome")}
      </Link>
    </div>
  )
}

function PlaylistPageContent() {
  const t = useTranslations("songs.playlistPage")
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { playlists, deletePlaylist } = usePlaylists()
  const { songs, removeSong } = usePlaylistSongs()
  const { activeTrackId, isPlaying, replaceQueue, pause } = useAudioPreview()
  const updatePlaybackTrack = useUpdatePlaybackTrack()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const playlist = playlists.find((p) => p.id === params.id)
  if (!playlist) return null

  const buildQueue = (): QueueTrack[] =>
    songs.map((s) => ({
      trackId: s.trackId,
      previewUrl: s.previewUrl,
      trackName: s.trackName,
      artistName: s.artistName,
      artworkUrl: s.artworkUrl,
    }))

  const hasActiveSong = songs.some((s) => s.trackId === activeTrackId)
  const isPlaylistPlaying = hasActiveSong && isPlaying

  const handlePlayAll = () => {
    if (isPlaylistPlaying) {
      pause()
      return
    }
    if (songs.length === 0) return
    const queue = buildQueue()
    const startIndex = hasActiveSong ? songs.findIndex((s) => s.trackId === activeTrackId) : 0
    replaceQueue(queue, startIndex)
    const track = songs[startIndex]
    if (track && updatePlaybackTrack) {
      updatePlaybackTrack({ trackName: track.trackName, artistName: track.artistName, artworkUrl: track.artworkUrl })
    }
  }

  const handlePlaySong = (index: number) => {
    const queue = buildQueue()
    replaceQueue(queue, index)
    const track = songs[index]
    if (track && updatePlaybackTrack) {
      updatePlaybackTrack({ trackName: track.trackName, artistName: track.artistName, artworkUrl: track.artworkUrl })
    }
  }

  const handleDelete = () => {
    deletePlaylist(playlist.id)
    setDeleteDialogOpen(false)
    router.push("/song")
  }

  return (
    <div className="px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      <PlaylistHeader
        playlist={playlist}
        songCount={songs.length}
        onPlay={handlePlayAll}
        onDelete={() => setDeleteDialogOpen(true)}
        isPlaying={isPlaylistPlaying}
      />

      <PlaylistSongList songs={songs} onRemove={removeSong} onPlay={handlePlaySong} />

      {/* Empty state */}
      {songs.length === 0 && (
        <div className="mt-12 flex flex-col items-center py-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{t("emptyTitle")}</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-white/50">{t("emptyHint")}</p>
          <Link
            href="/song"
            className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            {t("discoverMusic")}
          </Link>
        </div>
      )}

      <PlaylistRecommended />

      <DeletePlaylistDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        playlistName={playlist.name}
        onConfirm={handleDelete}
      />
    </div>
  )
}

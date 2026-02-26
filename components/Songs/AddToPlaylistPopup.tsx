"use client"

import { useCallback, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslations } from "next-intl"

import type { ITunesResult } from "hooks/useCatalogSearch"
import { usePlaylists } from "hooks/usePlaylists"
import { createClient } from "lib/supabase/client"
import { cn } from "lib/utils"

import { CloseIcon, PlaylistIcon, PlusIcon } from "./icons"

interface AddToPlaylistPopupProps {
  track: ITunesResult | null
  onClose: () => void
}

export function AddToPlaylistPopup({ track, onClose }: AddToPlaylistPopupProps) {
  const t = useTranslations("songs.addToPlaylist")
  const { playlists } = usePlaylists()
  const [addedTo, setAddedTo] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const supabaseRef = useRef(createClient())

  const handleAdd = useCallback(
    async (playlistId: string) => {
      if (!track || adding) return
      setAdding(true)

      const supabase = supabaseRef.current

      try {
        // Get current count for position
        const { count } = await supabase
          .from("playlist_songs")
          .select("*", { count: "exact", head: true })
          .eq("playlist_id", playlistId)

        const { error } = await supabase.from("playlist_songs").insert({
          playlist_id: playlistId,
          track_id: track.trackId,
          track_name: track.trackName,
          artist_name: track.artistName,
          artwork_url: track.artworkUrl100?.replace("100x100", "300x300") ?? "",
          preview_url: track.previewUrl ?? "",
          duration_ms: 0,
          position: count ?? 0,
        })

        if (!error) {
          setAddedTo(playlistId)
          setTimeout(() => onClose(), 600)
        }
      } catch {
        // Insert failed (e.g. duplicate)
      }
      setAdding(false)
    },
    [track, adding, onClose]
  )

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAddedTo(null)
      onClose()
    }
  }

  return (
    <Dialog.Root open={!!track} onOpenChange={handleOpenChange}>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {track && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                />
              </Dialog.Overlay>

              <Dialog.Content asChild aria-describedby={undefined}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-gray-900"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <Dialog.Title className="text-base font-bold text-gray-900 dark:text-white">
                      {t("title")}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60"
                        aria-label={t("close")}
                      >
                        <CloseIcon className="size-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Track info */}
                  <p className="mb-4 truncate text-sm text-gray-500 dark:text-white/50">
                    {track.trackName} — {track.artistName}
                  </p>

                  {/* Playlist list */}
                  {playlists.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-400 dark:text-white/30">{t("noPlaylists")}</p>
                  ) : (
                    <div className="max-h-60 space-y-1 overflow-y-auto">
                      {playlists.map((playlist) => {
                        const isAdded = addedTo === playlist.id

                        return (
                          <button
                            key={playlist.id}
                            type="button"
                            onClick={() => handleAdd(playlist.id)}
                            disabled={adding || isAdded}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                              isAdded
                                ? "bg-emerald-50 dark:bg-emerald-500/10"
                                : "hover:bg-gray-50 dark:hover:bg-white/5"
                            )}
                          >
                            <PlaylistIcon
                              className={cn(
                                "size-5 shrink-0",
                                isAdded ? "text-emerald-500" : "text-gray-400 dark:text-white/30"
                              )}
                            />
                            <span
                              className={cn(
                                "min-w-0 flex-1 truncate text-sm font-medium",
                                isAdded ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-white/80"
                              )}
                            >
                              {playlist.name}
                            </span>
                            {isAdded && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="size-5 shrink-0 text-emerald-500"
                                aria-hidden="true"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

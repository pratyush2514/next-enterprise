"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import { usePlaylists } from "hooks/usePlaylists"
import { useRouter } from "i18n/navigation"
import { cn } from "lib/utils"
import { generatePlaylistName } from "lib/utils/playlist-names"

import { CloseIcon, PlaylistIcon, SyncIcon } from "./icons"

interface CreatePlaylistPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePlaylistPopup({ open, onOpenChange }: CreatePlaylistPopupProps) {
  const t = useTranslations("songs.playlist")
  const prefersReducedMotion = useReducedMotion()
  const { createPlaylist } = usePlaylists()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreatePlaylist = async () => {
    if (isCreating) return
    setIsCreating(true)

    try {
      const playlist = await createPlaylist(generatePlaylistName())
      if (playlist) {
        onOpenChange(false)
        router.push(`/playlist/${playlist.id}`)
      }
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className={cn(
                  "fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 sm:max-w-sm",
                  "border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900"
                )}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("createNew")}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60"
                      aria-label={t("close")}
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {/* Playlist option */}
                  <button
                    type="button"
                    onClick={handleCreatePlaylist}
                    disabled={isCreating}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors active:scale-[0.98]",
                      "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/10 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/5",
                      isCreating && "pointer-events-none opacity-60"
                    )}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
                      <PlaylistIcon className="size-5 text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t("playlistOption")}</p>
                      <p className="text-xs text-gray-500 dark:text-white/50">{t("playlistDescription")}</p>
                    </div>
                  </button>

                  {/* Sync Mode option — disabled */}
                  <div
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border p-4",
                      "cursor-not-allowed border-gray-100 opacity-50 dark:border-white/5"
                    )}
                    aria-disabled="true"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
                      <SyncIcon className="size-5 text-gray-400 dark:text-white/40" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-400 dark:text-white/40">{t("syncModeOption")}</p>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400 dark:bg-white/5 dark:text-white/30">
                          {t("comingSoon")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-white/30">{t("syncModeDescription")}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import { cn } from "lib/utils"

import { CloseIcon } from "./icons"

interface DeletePlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlistName: string
  onConfirm: () => void
}

export function DeletePlaylistDialog({ open, onOpenChange, playlistName, onConfirm }: DeletePlaylistDialogProps) {
  const t = useTranslations("songs.playlistPage")
  const prefersReducedMotion = useReducedMotion()

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
            <Dialog.Content asChild>
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
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("deletePlaylist")}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600 dark:text-white/40 dark:hover:text-white/60"
                      aria-label="Close"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <p className="mb-6 text-sm text-gray-600 dark:text-white/60">
                  {t("deleteConfirm", { name: playlistName })}
                </p>

                <div className="flex items-center justify-end gap-3">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/5"
                    >
                      {t("deleteCancel")}
                    </button>
                  </Dialog.Close>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="min-h-[44px] rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    {t("deleteConfirmButton")}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

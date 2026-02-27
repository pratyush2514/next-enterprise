"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTranslations } from "next-intl"

import { usePlaylists } from "hooks/usePlaylists"
import { useSession } from "hooks/useSession"
import { createClient } from "lib/supabase/client"
import { cn } from "lib/utils"
import type { Playlist } from "types/playlist"

import { CloseIcon, PlaylistIcon, UploadIcon } from "./icons"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

interface PlaylistEditOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist: Playlist
}

export function PlaylistEditOverlay({ open, onOpenChange, playlist }: PlaylistEditOverlayProps) {
  const t = useTranslations("songs.playlistPage")
  const prefersReducedMotion = useReducedMotion()
  const { user } = useSession()
  const { renamePlaylist, updatePlaylistCover } = usePlaylists()

  const [name, setName] = useState(playlist.name)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset state when overlay opens or playlist changes
  useEffect(() => {
    if (open) {
      setName(playlist.name)
      setCoverPreview(null)
      setPendingFile(null)
      setIsDragOver(false)
      setIsSaving(false)
    }
  }, [open, playlist.name])

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) return
    setPendingFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      if (fileInputRef.current) fileInputRef.current.value = ""
    },
    [handleFile]
  )

  const handleSave = useCallback(async () => {
    if (!name.trim() || isSaving) return
    setIsSaving(true)

    try {
      // Rename if changed
      const trimmed = name.trim()
      if (trimmed !== playlist.name) {
        renamePlaylist(playlist.id, trimmed)
      }

      // Upload cover if a new file was selected
      if (pendingFile && user) {
        const supabase = createClient()
        const ext = pendingFile.name.split(".").pop() ?? "jpg"
        const path = `${user.id}/${playlist.id}.${ext}`

        const { error: uploadError } = await supabase.storage.from("playlist-covers").upload(path, pendingFile, {
          upsert: true,
          contentType: pendingFile.type,
        })

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("playlist-covers").getPublicUrl(path)
          updatePlaylistCover(playlist.id, `${publicUrl}?t=${Date.now()}`)
        }
      }

      onOpenChange(false)
    } catch {
      // Save failed silently
    } finally {
      setIsSaving(false)
    }
  }, [name, isSaving, playlist.id, playlist.name, pendingFile, user, renamePlaylist, updatePlaylistCover, onOpenChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSave()
      }
    },
    [handleSave]
  )

  const displayCover = coverPreview ?? playlist.coverUrl

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
                transition={prefersReducedMotion ? { duration: 0.1 } : { type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                  {/* Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <Dialog.Title className="text-lg font-bold text-white">{t("editDetails")}</Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="rounded-full p-1 text-white/40 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                        aria-label={t("cancel")}
                      >
                        <CloseIcon className="size-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <Dialog.Description className="sr-only">{t("editDescription")}</Dialog.Description>

                  {/* Body — cover + name input side by side */}
                  <div className="flex flex-col gap-6 sm:flex-row">
                    {/* Cover area — click + drag-and-drop */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        "group relative flex size-40 shrink-0 items-center justify-center self-center overflow-hidden rounded-xl shadow-lg transition-all sm:size-48",
                        displayCover ? "bg-gray-800" : "bg-gradient-to-br from-emerald-400/20 to-emerald-600/20",
                        isDragOver && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-gray-900"
                      )}
                      aria-label={t("uploadCover")}
                    >
                      {displayCover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={displayCover} alt="" className="size-full object-cover" />
                      ) : (
                        <PlaylistIcon className="size-16 text-emerald-500/40" />
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 transition-colors group-hover:bg-black/50">
                        <UploadIcon className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        <span className="text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {t("uploadCover")}
                        </span>
                      </div>

                      {/* Drag overlay */}
                      {isDragOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                          <span className="text-sm font-bold text-emerald-400">{t("dropHere")}</span>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        onChange={handleFileInput}
                        className="hidden"
                        aria-hidden="true"
                      />
                    </button>

                    {/* Name input */}
                    <div className="flex flex-1 flex-col justify-center gap-2">
                      <label htmlFor="playlist-edit-name" className="text-xs font-semibold text-white/40 uppercase">
                        {t("namePlaceholder")}
                      </label>
                      <input
                        ref={inputRef}
                        id="playlist-edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t("namePlaceholder")}
                        className={cn(
                          "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base font-medium text-white placeholder:text-white/20",
                          "transition-colors focus:border-emerald-500 focus:outline-none"
                        )}
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 flex justify-end gap-3">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="rounded-full px-6 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:text-white"
                      >
                        {t("cancel")}
                      </button>
                    </Dialog.Close>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!name.trim() || isSaving}
                      className={cn(
                        "rounded-full bg-emerald-500 px-8 py-2.5 text-sm font-bold text-white",
                        "transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-400 active:scale-[0.98]",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
                        "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
                      )}
                    >
                      {isSaving ? t("loading") : t("save")}
                    </button>
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

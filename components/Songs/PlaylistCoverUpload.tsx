"use client"

import { useCallback, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { usePlaylists } from "hooks/usePlaylists"
import { useSession } from "hooks/useSession"
import { createClient } from "lib/supabase/client"
import { cn } from "lib/utils"

import { PlaylistIcon } from "./icons"

interface PlaylistCoverUploadProps {
  playlistId: string
  coverUrl: string | null
  playlistName: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function PlaylistCoverUpload({ playlistId, coverUrl, playlistName }: PlaylistCoverUploadProps) {
  const t = useTranslations("songs.playlistPage")
  const { user } = useSession()
  const { updatePlaylistCover } = usePlaylists()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !user || isUploading) return

      if (!ACCEPTED_TYPES.includes(file.type)) return
      if (file.size > MAX_FILE_SIZE) return

      setIsUploading(true)

      try {
        const supabase = createClient()
        const ext = file.name.split(".").pop() ?? "jpg"
        const path = `${user.id}/${playlistId}.${ext}`

        const { error: uploadError } = await supabase.storage.from("playlist-covers").upload(path, file, {
          upsert: true,
          contentType: file.type,
        })

        if (uploadError) {
          setIsUploading(false)
          return
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("playlist-covers").getPublicUrl(path)

        // Bust cache with timestamp
        const url = `${publicUrl}?t=${Date.now()}`
        updatePlaylistCover(playlistId, url)
      } catch {
        // Upload failed
      }

      setIsUploading(false)

      // Reset input so re-uploading the same file triggers onChange
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    },
    [user, playlistId, isUploading, updatePlaylistCover]
  )

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group relative flex size-40 shrink-0 items-center justify-center self-center overflow-hidden rounded-xl shadow-lg transition-opacity sm:size-48 sm:self-auto",
        coverUrl
          ? "bg-gray-100 dark:bg-white/5"
          : "bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 dark:from-emerald-400/10 dark:to-emerald-600/10",
        isUploading && "pointer-events-none opacity-60"
      )}
      aria-label={t("changeCover")}
    >
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt={playlistName} className="size-full object-cover" />
      ) : (
        <PlaylistIcon className="size-16 text-emerald-500/40" />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
        <span className="text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
          {t("changeCover")}
        </span>
      </div>

      {/* Uploading spinner */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleUpload}
        className="hidden"
        aria-hidden="true"
      />
    </button>
  )
}

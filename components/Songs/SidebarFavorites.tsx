"use client"

import * as Tooltip from "@radix-ui/react-tooltip"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { type QueueTrack, useAudioPreview } from "hooks/useAudioPreview"
import { useFavorites } from "hooks/useFavorites"
import { useSession } from "hooks/useSession"
import { Link, usePathname } from "i18n/navigation"
import { cn } from "lib/utils"

import { HeartIcon } from "./icons"
import { useUpdatePlaybackTrack } from "./SongsShell"

interface SidebarFavoritesProps {
  isCollapsed: boolean
}

export function SidebarFavorites({ isCollapsed }: SidebarFavoritesProps) {
  const t = useTranslations("songs.sidebar")
  const { isAuthenticated } = useSession()
  const { favorites, isLoading, count } = useFavorites()
  const { replaceQueue, activeTrackId } = useAudioPreview()
  const updatePlaybackTrack = useUpdatePlaybackTrack()
  const pathname = usePathname()

  if (!isAuthenticated) return null

  const handlePlayFavorite = (index: number) => {
    const queue: QueueTrack[] = favorites
      .filter((f) => f.artworkUrl100)
      .map((f) => ({
        trackId: f.trackId,
        previewUrl: "", // Preview URLs not stored in favorites — playback will use toggle fallback
        trackName: f.trackName,
        artistName: f.artistName,
        artworkUrl: f.artworkUrl100.replace("100x100", "300x300"),
      }))

    const track = favorites[index]
    if (track) {
      updatePlaybackTrack?.({
        trackName: track.trackName,
        artistName: track.artistName,
        artworkUrl: track.artworkUrl100.replace("100x100", "300x300"),
      })
      if (queue[index]) {
        replaceQueue(queue, index)
      }
    }
  }

  // Collapsed mode: clickable icon linking to favorites page + mini thumbnails
  if (isCollapsed) {
    const isFavActive = pathname === "/song/favorites"

    return (
      <div className="mt-4 flex flex-col items-center gap-2 border-t border-gray-200 pt-4 dark:border-white/5">
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <Link
              href="/song/favorites"
              className={cn(
                "relative flex size-9 items-center justify-center rounded-lg transition-colors",
                isFavActive
                  ? "bg-emerald-400/15 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white/60"
              )}
              aria-label={`${t("favorites")} (${count})`}
            >
              <HeartIcon filled={count > 0} className={cn("size-4", count > 0 && !isFavActive && "text-red-500")} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={8}
              className="z-50 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-gray-900"
            >
              {t("favorites")}
              {count > 0 ? ` (${count})` : ""}
              <Tooltip.Arrow className="fill-gray-900 dark:fill-white" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Mini favorite thumbnails */}
        {!isLoading && count > 0 && (
          <div className="flex max-h-32 flex-col items-center gap-1 overflow-y-auto">
            {favorites.slice(0, 8).map((fav, index) => (
              <Tooltip.Root key={fav.trackId} delayDuration={200}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    onClick={() => handlePlayFavorite(index)}
                    className={cn(
                      "size-8 shrink-0 overflow-hidden rounded transition-opacity hover:opacity-80",
                      activeTrackId === fav.trackId && "ring-2 ring-emerald-500"
                    )}
                  >
                    {fav.artworkUrl100 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fav.artworkUrl100} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-gray-100 dark:bg-white/5">
                        <HeartIcon filled className="size-3 text-red-400" />
                      </div>
                    )}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={8}
                    className="z-50 max-w-48 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-gray-900"
                  >
                    <p className="truncate">{fav.trackName}</p>
                    <p className="truncate opacity-60">{fav.artistName}</p>
                    <Tooltip.Arrow className="fill-gray-900 dark:fill-white" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-col border-t border-gray-200 pt-4 dark:border-white/5">
      <h3 className="mb-2 px-3 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase dark:text-white/30">
        {t("favorites")}
      </h3>

      {isLoading && (
        <div className="space-y-2 px-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`fav-skel-${i}`} className="flex animate-pulse items-center gap-2.5">
              <div className="size-8 shrink-0 rounded bg-gray-200 dark:bg-white/10" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && count === 0 && <p className="px-3 text-xs text-gray-400 dark:text-white/30">{t("noFavorites")}</p>}

      {!isLoading && count > 0 && (
        <div className="max-h-48 space-y-0.5 overflow-y-auto px-1">
          {favorites.map((fav, index) => (
            <button
              key={fav.trackId}
              type="button"
              onClick={() => handlePlayFavorite(index)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors",
                activeTrackId === fav.trackId
                  ? "bg-emerald-400/15 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/5"
              )}
            >
              <div className="relative size-8 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-white/5">
                {fav.artworkUrl100 && (
                  <Image src={fav.artworkUrl100} alt="" fill unoptimized className="object-cover" sizes="32px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{fav.trackName}</p>
                <p className="truncate text-[10px] opacity-60">{fav.artistName}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

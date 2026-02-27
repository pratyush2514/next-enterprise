"use client"

import { useState } from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { useTranslations } from "next-intl"

import { usePlaylists } from "hooks/usePlaylists"
import { useSession } from "hooks/useSession"
import { Link, usePathname } from "i18n/navigation"
import { cn } from "lib/utils"

import { AnimatedPlaylistIcon } from "./AnimatedPlaylistIcon"
import { PlaylistIcon } from "./icons"

interface SidebarPlaylistsProps {
  isCollapsed: boolean
}

export function SidebarPlaylists({ isCollapsed }: SidebarPlaylistsProps) {
  const t = useTranslations("songs.sidebar")
  const { isAuthenticated } = useSession()
  const { playlists, isLoading } = usePlaylists()
  const pathname = usePathname()

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!isAuthenticated) return null

  const count = playlists.length

  // Collapsed mode: clickable playlist links with tooltips
  if (isCollapsed) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2 border-t border-gray-200 pt-4 dark:border-white/5">
        {/* Section icon with count */}
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <div
              className="relative flex size-9 items-center justify-center"
              aria-label={`${t("playlists")} (${count})`}
            >
              <PlaylistIcon className="size-4 text-gray-400 dark:text-white/40" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </div>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={8}
              className="z-50 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-gray-900"
            >
              {t("playlists")}
              {count > 0 ? ` (${count})` : ""}
              <Tooltip.Arrow className="fill-gray-900 dark:fill-white" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Mini playlist thumbnails */}
        {!isLoading && count > 0 && (
          <div className="flex max-h-32 flex-col items-center gap-1 overflow-y-auto">
            {playlists.map((playlist) => {
              const isActive = pathname === `/playlist/${playlist.id}`

              return (
                <Tooltip.Root key={playlist.id} delayDuration={200}>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={`/playlist/${playlist.id}`}
                      className={cn(
                        "size-8 shrink-0 overflow-hidden rounded transition-opacity hover:opacity-80",
                        isActive && "ring-2 ring-emerald-500"
                      )}
                    >
                      {playlist.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={playlist.coverUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-gray-100 dark:bg-white/5">
                          <PlaylistIcon className="size-3.5 text-gray-400 dark:text-white/30" />
                        </div>
                      )}
                    </Link>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      sideOffset={8}
                      className="z-50 max-w-48 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-gray-900"
                    >
                      {playlist.name}
                      <Tooltip.Arrow className="fill-gray-900 dark:fill-white" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-col border-t border-gray-200 pt-4 dark:border-white/5">
      <h3 className="mb-2 px-3 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase dark:text-white/30">
        {t("playlists")}
      </h3>

      {isLoading && (
        <div className="space-y-2 px-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`pl-skel-${i}`} className="flex animate-pulse items-center gap-2.5">
              <div className="size-8 shrink-0 rounded bg-gray-200 dark:bg-white/10" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && count === 0 && <p className="px-3 text-xs text-gray-400 dark:text-white/30">{t("noPlaylists")}</p>}

      {!isLoading && count > 0 && (
        <div className="max-h-48 space-y-0.5 overflow-y-auto px-1">
          {playlists.map((playlist) => {
            const isActive = pathname === `/playlist/${playlist.id}`

            return (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className={cn(
                  "flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors active:scale-[0.98]",
                  isActive
                    ? "bg-emerald-400/15 text-emerald-600 dark:text-emerald-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/5"
                )}
                onMouseEnter={() => setHoveredId(playlist.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="size-8 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-white/5">
                  {playlist.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={playlist.coverUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <AnimatedPlaylistIcon className="size-5" playing={hoveredId === playlist.id || isActive} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{playlist.name}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

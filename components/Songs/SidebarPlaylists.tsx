"use client"

import { useTranslations } from "next-intl"

import { usePlaylists } from "hooks/usePlaylists"
import { useSession } from "hooks/useSession"
import { Link, usePathname } from "i18n/navigation"
import { cn } from "lib/utils"

import { PlaylistIcon } from "./icons"

interface SidebarPlaylistsProps {
  isCollapsed: boolean
}

export function SidebarPlaylists({ isCollapsed }: SidebarPlaylistsProps) {
  const t = useTranslations("songs.sidebar")
  const { isAuthenticated } = useSession()
  const { playlists, isLoading } = usePlaylists()
  const pathname = usePathname()

  if (!isAuthenticated) return null

  const count = playlists.length

  // Collapsed mode: show playlist icon with count badge
  if (isCollapsed) {
    return (
      <div className="mt-4 flex flex-col items-center border-t border-gray-200 pt-4 dark:border-white/5">
        <div className="relative" aria-label={`${t("playlists")} (${count})`}>
          <PlaylistIcon className="size-4 text-gray-400 dark:text-white/40" />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </div>
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
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-white/5">
                  <PlaylistIcon className="size-4 text-gray-400 dark:text-white/40" />
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

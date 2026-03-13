"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { PlaylistHeader } from "components/Songs/PlaylistHeader"
import { usePlaylists } from "hooks/usePlaylists"
import { Link } from "i18n/navigation"

export default function PlaylistPage() {
  const t = useTranslations("songs.playlistPage")
  const params = useParams<{ id: string }>()
  const { playlists, isLoading } = usePlaylists()

  const playlist = playlists.find((p) => p.id === params.id)

  // Loading skeleton
  if (isLoading) {
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

  // Not found
  if (!playlist) {
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

  return (
    <div className="px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      <PlaylistHeader playlist={playlist} songCount={0} onPlay={() => {}} onDelete={() => {}} />

      {/* Empty state — songs will be wired in PR #5 */}
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
    </div>
  )
}

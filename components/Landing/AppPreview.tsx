"use client"

import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"

import { cn } from "lib/utils"

import {
  MelodixLogoIcon,
  MoreMenuIcon,
  MusicNotePlaceholderIcon,
  PauseIcon,
  QueueIcon,
  SidebarIcon,
  SkipNextIcon,
} from "./icons"
import type { SidebarIconType } from "./icons"
import { ScrollReveal } from "./ScrollReveal"

/* ── Shared types ────────────────────────────────────────────────── */

export interface PreviewPoster {
  trackName: string
  artistName: string
  artworkUrl: string
}

export interface AppPreviewData {
  quickStart: PreviewPoster[]
  mood: PreviewPoster[]
  discover: PreviewPoster[]
  nowPlaying: PreviewPoster | null
}

/* ── Sidebar navigation ──────────────────────────────────────────── */

const SIDEBAR_ITEMS: { label: string; icon: SidebarIconType; active?: boolean }[] = [
  { label: "Agendas", icon: "calendar" },
  { label: "Channels", icon: "channels", active: true },
  { label: "Playlists", icon: "playlist" },
  { label: "Search", icon: "search" },
  { label: "Settings", icon: "settings" },
]

/* ── Category labels ─────────────────────────────────────────────── */

const QUICK_START_LABELS = ["Hit Factory", "Popular & Nostalgic", "Young & Alternative", "Stylish & Artist"]
const MOOD_LABELS = ["Barista Bar", "Beauty Salon", "Chill Out Zone", "Club Lounge"]

/* ── Poster section — reusable grid with title + guard ────────────── */

function PosterSection({
  title,
  posters,
  labels,
  columns = 4,
  className,
  keyPrefix,
}: {
  title: string
  posters: PreviewPoster[]
  labels?: string[]
  columns?: number
  className?: string
  keyPrefix: string
}) {
  if (posters.length === 0) return null
  return (
    <div className={className}>
      <h3 className="mb-2.5 text-sm font-bold text-white">{title}</h3>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {posters.map((poster, i) => (
          <PosterCard key={`${keyPrefix}-${i}`} poster={poster} label={labels?.[i]} />
        ))}
      </div>
    </div>
  )
}

/* ── Album poster card ───────────────────────────────────────────── */

function PosterCard({ poster, label }: { poster: PreviewPoster; label?: string }) {
  return (
    <div className="group/card shrink-0 cursor-pointer">
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg shadow-md transition-transform duration-300 group-hover/card:scale-[1.03]">
        {poster.artworkUrl ? (
          <Image
            src={poster.artworkUrl}
            alt={`${poster.trackName} by ${poster.artistName}`}
            fill
            unoptimized
            className="object-cover"
            sizes="120px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10">
            <MusicNotePlaceholderIcon className="size-6 text-white/20" />
          </div>
        )}

        {/* Bottom frosted text overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 pt-6 pb-1.5">
          <p className="truncate text-[9px] leading-tight font-bold text-white drop-shadow-sm">{poster.trackName}</p>
          <p className="truncate text-[7px] text-white/60">{poster.artistName}</p>
        </div>
      </div>
      {label && <p className="text-center text-[10px] leading-tight font-medium text-white/70">{label}</p>}
    </div>
  )
}

/* ── Mini Player ─────────────────────────────────────────────────── */

function MiniPlayer({ nowPlaying }: { nowPlaying?: PreviewPoster | null }) {
  const track = nowPlaying ?? { trackName: "The Hipsters", artistName: "Deacon Blue", artworkUrl: "" }

  return (
    <div className="flex items-center gap-3 border-t border-white/5 bg-gray-950/80 px-4 py-3">
      {/* Album art */}
      <div className="relative size-10 shrink-0 overflow-hidden rounded">
        {track.artworkUrl ? (
          <Image src={track.artworkUrl} alt="" fill unoptimized className="object-cover" sizes="40px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10">
            <MusicNotePlaceholderIcon className="size-4 text-white/30" />
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-white">{track.trackName}</p>
        <p className="truncate text-[10px] text-white/40">{track.artistName}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <button type="button" className="text-white/40" aria-label="Queue">
          <QueueIcon />
        </button>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-full bg-white text-gray-900"
          aria-label="Pause"
        >
          <PauseIcon />
        </button>
        <button type="button" className="text-white/40" aria-label="Next">
          <SkipNextIcon />
        </button>
      </div>

      {/* More menu */}
      <button type="button" className="text-white/30" aria-label="More options">
        <MoreMenuIcon />
      </button>
    </div>
  )
}

/* ── Main section ────────────────────────────────────────────────── */

export function AppPreview({ data }: { data?: AppPreviewData }) {
  const prefersReducedMotion = useReducedMotion()

  const quickStart = data?.quickStart ?? []
  const mood = data?.mood ?? []
  const discover = data?.discover ?? []
  const nowPlaying = data?.nowPlaying ?? null

  return (
    <section className="from-brand-900 to-brand-950 relative bg-gradient-to-b pb-24 lg:pb-32">
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <ScrollReveal delay={0.1}>
          <motion.div
            className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gray-950 shadow-2xl shadow-black/50"
            whileHover={prefersReducedMotion ? {} : { scale: 1.005 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          >
            {/* App frame */}
            <div className="flex min-h-[420px] sm:min-h-[480px] lg:min-h-[520px]">
              {/* Sidebar */}
              <div className="hidden w-44 shrink-0 flex-col border-r border-white/5 bg-gray-950 p-4 sm:flex">
                {/* Sidebar logo */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded bg-emerald-400">
                    <MelodixLogoIcon />
                  </div>
                  <span className="text-sm font-bold text-white">melodix</span>
                </div>

                {/* Nav items */}
                <nav className="flex flex-col gap-0.5">
                  {SIDEBAR_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                        item.active ? "bg-emerald-400/15 text-emerald-400" : "text-white/40 hover:text-white/60"
                      )}
                    >
                      <SidebarIcon type={item.icon} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main content */}
              <div className="flex flex-1 flex-col">
                <div className="flex-1 overflow-hidden p-5 sm:p-6">
                  <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Music Channels</p>

                  <PosterSection
                    title="Quick start"
                    posters={quickStart}
                    labels={QUICK_START_LABELS}
                    keyPrefix="qs"
                    className="mb-5"
                  />
                  <PosterSection
                    title="Create mood"
                    posters={mood}
                    labels={MOOD_LABELS}
                    keyPrefix="mood"
                    className="mb-5"
                  />
                  <PosterSection title="Discover more" posters={discover} columns={5} keyPrefix="disc" />
                </div>

                {/* Mini Player */}
                <MiniPlayer nowPlaying={nowPlaying} />
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}

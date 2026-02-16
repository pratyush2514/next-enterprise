"use client"

import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"

import { cn } from "lib/utils"

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

const SIDEBAR_ITEMS = [
  { label: "Agendas", icon: "calendar" },
  { label: "Channels", icon: "channels", active: true },
  { label: "Playlists", icon: "playlist" },
  { label: "Search", icon: "search" },
  { label: "Settings", icon: "settings" },
]

/* ── Category labels ─────────────────────────────────────────────── */

const QUICK_START_LABELS = ["Hit Factory", "Popular & Nostalgic", "Young & Alternative", "Stylish & Artist"]
const MOOD_LABELS = ["Barista Bar", "Beauty Salon", "Chill Out Zone", "Club Lounge"]

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-white/20"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
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

/* ── Sidebar icons ───────────────────────────────────────────────── */

function SidebarIcon({ type }: { type: string }) {
  const size = 16
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (type) {
    case "calendar":
      return (
        <svg {...props}>
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      )
    case "channels":
      return (
        <svg {...props}>
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
        </svg>
      )
    case "playlist":
      return (
        <svg {...props}>
          <line x1="8" x2="21" y1="6" y2="6" />
          <line x1="8" x2="21" y1="12" y2="12" />
          <line x1="8" x2="21" y1="18" y2="18" />
          <line x1="3" x2="3.01" y1="6" y2="6" />
          <line x1="3" x2="3.01" y1="12" y2="12" />
          <line x1="3" x2="3.01" y1="18" y2="18" />
        </svg>
      )
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )
    case "settings":
      return (
        <svg {...props}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    default:
      return null
  }
}

/* ── Mini Player ─────────────────────────────────────────────────── */

function MiniPlayer({ nowPlaying }: { nowPlaying?: PreviewPoster | null }) {
  const track = nowPlaying ?? { trackName: "The Hipsters", artistName: "Deacon Blue", artworkUrl: "" }

  return (
    <div className="flex items-center gap-3 border-t border-white/5 bg-[#1a1a2e]/80 px-4 py-3">
      {/* Album art */}
      <div className="relative size-10 shrink-0 overflow-hidden rounded">
        {track.artworkUrl ? (
          <Image src={track.artworkUrl} alt="" fill unoptimized className="object-cover" sizes="40px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 text-white/30"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              />
            </svg>
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-full bg-white text-gray-900"
          aria-label="Pause"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
          </svg>
        </button>
        <button type="button" className="text-white/40" aria-label="Next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {/* More menu */}
      <button type="button" className="text-white/30" aria-label="More options">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
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
    <section className="relative bg-gradient-to-b from-[#061A11] to-[#030D08] pb-24 lg:pb-32">
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <ScrollReveal delay={0.1}>
          <motion.div
            className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d1a] shadow-2xl shadow-black/50"
            whileHover={prefersReducedMotion ? {} : { scale: 1.005 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          >
            {/* App frame */}
            <div className="flex min-h-[420px] sm:min-h-[480px] lg:min-h-[520px]">
              {/* Sidebar */}
              <div className="hidden w-44 shrink-0 flex-col border-r border-white/5 bg-[#0d0d1a] p-4 sm:flex">
                {/* Sidebar logo */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded bg-[#2DD282]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M9 18V5l12-2v13" />
                    </svg>
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
                        item.active ? "bg-[#2DD282]/15 text-[#2DD282]" : "text-white/40 hover:text-white/60"
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

                  {/* Quick Start */}
                  {quickStart.length > 0 && (
                    <div className="mb-5">
                      <h3 className="mb-2.5 text-sm font-bold text-white">Quick start</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {quickStart.map((poster, i) => (
                          <PosterCard key={`qs-${i}`} poster={poster} label={QUICK_START_LABELS[i]} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Create Mood */}
                  {mood.length > 0 && (
                    <div className="mb-5">
                      <h3 className="mb-2.5 text-sm font-bold text-white">Create mood</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {mood.map((poster, i) => (
                          <PosterCard key={`mood-${i}`} poster={poster} label={MOOD_LABELS[i]} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discover more */}
                  {discover.length > 0 && (
                    <div>
                      <h3 className="mb-2.5 text-sm font-bold text-white">Discover more</h3>
                      <div className="grid grid-cols-5 gap-3">
                        {discover.map((poster, i) => (
                          <PosterCard key={`disc-${i}`} poster={poster} />
                        ))}
                      </div>
                    </div>
                  )}
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

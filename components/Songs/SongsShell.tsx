"use client"

import { createContext, useCallback, useContext, useState } from "react"

import { AudioPreviewProvider } from "hooks/useAudioPreview"
import { FavoritesProvider } from "hooks/useFavorites"
import { PlaylistsProvider } from "hooks/usePlaylists"
import { useSidebarState } from "hooks/useSidebarState"

import { MenuIcon } from "./icons"
import { PlaybackBar } from "./PlaybackBar"
import { ProfileDropdown } from "./ProfileDropdown"
import { Sidebar } from "./Sidebar"

/* ── Playback track metadata context ──────────────────────────────── */

export interface PlaybackTrackInfo {
  trackName: string
  artistName: string
  artworkUrl: string
}

type UpdateTrackFn = (track: PlaybackTrackInfo) => void

const SongsPlaybackContext = createContext<UpdateTrackFn | null>(null)

export function useUpdatePlaybackTrack() {
  return useContext(SongsPlaybackContext)
}

/* ── Inner shell (needs AudioPreviewProvider context) ─────────────── */

function SongsShellInner({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlaybackTrackInfo | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isCollapsed, toggle } = useSidebarState()

  const updateCurrentTrack = useCallback((track: PlaybackTrackInfo) => {
    setCurrentTrack(track)
  }, [])

  return (
    <SongsPlaybackContext.Provider value={updateCurrentTrack}>
      <div className="flex h-[100dvh] bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={toggle}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2.5 lg:px-6 dark:border-white/5">
            {/* Left side — mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex size-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-white/5"
              aria-label="Open menu"
            >
              <MenuIcon className="size-5" />
            </button>
            {/* Right side — profile */}
            <div className="ml-auto">
              <ProfileDropdown />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto pb-24">{children}</main>
        </div>
        <PlaybackBar currentTrack={currentTrack} />
      </div>
    </SongsPlaybackContext.Provider>
  )
}

/* ── Root shell — wraps in providers ──────────────────────────────── */

export function SongsShell({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <PlaylistsProvider>
        <AudioPreviewProvider>
          <SongsShellInner>{children}</SongsShellInner>
        </AudioPreviewProvider>
      </PlaylistsProvider>
    </FavoritesProvider>
  )
}

import type { SidebarIconType } from "components/Landing/icons"

export interface SidebarNavItem {
  key: string
  icon: SidebarIconType
  href: string
  type: "link" | "action"
}

export const SIDEBAR_NAV: SidebarNavItem[] = [
  { key: "home", icon: "channels", href: "/song", type: "link" },
  { key: "search", icon: "search", href: "/song#search", type: "link" },
  { key: "settings", icon: "settings", href: "#", type: "action" },
]

export const SONGS_ROUTES = {
  SONG: "/song",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROFILE: "/profile",
  PLAYLIST: "/playlist",
} as const

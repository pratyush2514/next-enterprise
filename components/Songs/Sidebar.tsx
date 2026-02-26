"use client"

import { useState } from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { useTranslations } from "next-intl"

import { SidebarIcon } from "components/Landing/icons"
import { useFavorites } from "hooks/useFavorites"
import { useSession } from "hooks/useSession"
import { Link, usePathname } from "i18n/navigation"
import { cn } from "lib/utils"

import { SIDEBAR_NAV } from "./constants"
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from "./icons"
import { SettingsPanel } from "./SettingsPanel"
import { SidebarFavorites } from "./SidebarFavorites"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

function NavTooltip({ children, label, enabled }: { children: React.ReactNode; label: string; enabled: boolean }) {
  if (!enabled) return <>{children}</>

  return (
    <Tooltip.Root delayDuration={200}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="z-50 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-gray-900"
        >
          {label}
          <Tooltip.Arrow className="fill-gray-900 dark:fill-white" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const t = useTranslations("songs.sidebar")
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { isAuthenticated } = useSession()
  const { count } = useFavorites()

  const isIconOnly = isCollapsed
  const iconSize = isIconOnly ? 20 : 16

  return (
    <Tooltip.Provider>
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-gray-200 bg-gray-50 md:flex dark:border-white/5 dark:bg-gray-950",
          "transition-[width,padding] duration-200 ease-in-out",
          isCollapsed ? "w-[60px] p-2 lg:w-[60px]" : "w-[60px] p-2 lg:w-56 lg:p-4"
        )}
      >
        {/* Logo + collapse toggle row */}
        <div
          className={cn(
            "mb-4 flex items-center",
            isCollapsed ? "justify-center" : "justify-center lg:justify-between lg:px-2"
          )}
        >
          <Link href="/song" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M9 18V5l12-2v13" />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="hidden text-lg font-bold tracking-tight text-gray-900 lg:block dark:text-white">
                melodix
              </span>
            )}
          </Link>

          {/* Collapse / expand toggle — on lg+ only */}
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "hidden items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors lg:flex",
              "hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-white/60",
              isCollapsed && "lg:hidden"
            )}
            aria-label={t("collapse")}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
        </div>

        {/* Expand button — shown when collapsed, centered */}
        {isCollapsed && (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "mb-3 hidden items-center justify-center rounded-lg p-1.5 text-gray-400 transition-colors lg:flex",
              "hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-white/60"
            )}
            aria-label={t("expand")}
          >
            <ChevronRightIcon className="size-4" />
          </button>
        )}

        {/* Nav items */}
        <nav className="flex flex-col gap-1">
          {SIDEBAR_NAV.map((item) => {
            const isActive = item.href === "/song" ? pathname === "/song" : pathname.startsWith(item.href)

            if (item.type === "action") {
              return (
                <NavTooltip key={item.key} label={t(item.key)} enabled={isIconOnly}>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isIconOnly ? "justify-center" : "justify-center lg:justify-start",
                      "text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80"
                    )}
                    aria-label={t(item.key)}
                  >
                    <SidebarIcon type={item.icon} size={iconSize} />
                    {!isCollapsed && <span className="hidden lg:inline">{t(item.key)}</span>}
                  </button>
                </NavTooltip>
              )
            }

            return (
              <NavTooltip key={item.key} label={t(item.key)} enabled={isIconOnly}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isIconOnly ? "justify-center" : "justify-center lg:justify-start",
                    isActive
                      ? "bg-emerald-400/15 text-emerald-600 dark:text-emerald-400"
                      : "text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80"
                  )}
                  aria-label={t(item.key)}
                >
                  <SidebarIcon type={item.icon} size={iconSize} />
                  {!isCollapsed && <span className="hidden lg:inline">{t(item.key)}</span>}
                </Link>
              </NavTooltip>
            )
          })}

          {/* Favorites nav item */}
          {isAuthenticated && (
            <NavTooltip label={`${t("favorites")}${count > 0 ? ` (${count})` : ""}`} enabled={isIconOnly}>
              <Link
                href="/song/favorites"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isIconOnly ? "justify-center" : "justify-center lg:justify-start",
                  pathname === "/song/favorites"
                    ? "bg-emerald-400/15 text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white/80"
                )}
                aria-label={`${t("favorites")}${count > 0 ? ` (${count})` : ""}`}
              >
                <div
                  className="relative flex shrink-0 items-center justify-center"
                  style={{ width: iconSize, height: iconSize }}
                >
                  <HeartIcon
                    filled={count > 0}
                    className={cn("size-full", count > 0 ? "text-red-500" : "text-current")}
                  />
                  {count > 0 && isIconOnly && (
                    <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="hidden items-center gap-2 lg:flex">
                    {t("favorites")}
                    {count > 0 && (
                      <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-500 dark:bg-red-500/20">
                        {count}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            </NavTooltip>
          )}
        </nav>

        {/* Favorites list */}
        <SidebarFavorites isCollapsed={isCollapsed} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings modal */}
        <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      </aside>
    </Tooltip.Provider>
  )
}

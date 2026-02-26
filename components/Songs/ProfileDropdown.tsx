"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { Link } from "i18n/navigation"
import { useAuth } from "lib/contexts/auth-context"
import { cn } from "lib/utils"

import { SONGS_ROUTES } from "./constants"
import { LogOutIcon, UserIcon } from "./icons"

export function ProfileDropdown() {
  const t = useTranslations("songs.profile")
  const { user, profile, loading, signOut } = useAuth()

  if (loading) {
    return <div className="size-10 animate-pulse rounded-full bg-gray-200 dark:bg-white/10" />
  }

  if (!user) {
    return (
      <Link
        href={SONGS_ROUTES.LOGIN}
        className={cn(
          "rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
        )}
      >
        {t("logIn")}
      </Link>
    )
  }

  const displayName = profile?.full_name || user.email || ""
  const initials = displayName.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = SONGS_ROUTES.LOGIN
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative flex size-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-gray-950"
          aria-label={displayName}
        >
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt=""
              fill
              unoptimized
              className="rounded-full object-cover"
              sizes="32px"
            />
          ) : (
            <div className="flex size-full items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
              {initials}
            </div>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "z-50 min-w-[180px] overflow-hidden rounded-xl border p-1 shadow-lg",
            "border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900",
            "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
          )}
          sideOffset={8}
          align="end"
        >
          {/* User info header */}
          <div className="border-b border-gray-100 px-3 py-2 dark:border-white/5">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
            {user.email && displayName !== user.email && (
              <p className="truncate text-xs text-gray-500 dark:text-white/40">{user.email}</p>
            )}
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href={SONGS_ROUTES.PROFILE}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors outline-none",
                "hover:bg-gray-100 focus:bg-gray-100 dark:text-white/70 dark:hover:bg-white/5 dark:focus:bg-white/5"
              )}
            >
              <UserIcon className="size-4" />
              {t("account")}
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-100 dark:bg-white/5" />

          <DropdownMenu.Item
            onSelect={handleSignOut}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors outline-none",
              "hover:bg-gray-100 focus:bg-gray-100 dark:text-white/70 dark:hover:bg-white/5 dark:focus:bg-white/5"
            )}
          >
            <LogOutIcon className="size-4" />
            {t("signOut")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

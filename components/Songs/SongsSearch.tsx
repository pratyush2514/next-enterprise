"use client"

import { useTranslations } from "next-intl"

import { cn } from "lib/utils"

import { CloseIcon, SearchIcon } from "./icons"

interface SongsSearchProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SongsSearch({ value, onChange, className }: SongsSearchProps) {
  const t = useTranslations("songs")

  return (
    <div className={cn("relative w-full", className)} id="search">
      <label htmlFor="songs-search" className="sr-only">
        {t("searchLabel")}
      </label>
      <SearchIcon className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/30" />
      <input
        id="songs-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className={cn(
          "w-full rounded-full border border-white/10 bg-white/5 py-3 pr-11 pl-11 text-sm text-white",
          "shadow-sm transition-all duration-300",
          "placeholder:text-white/30",
          "focus:border-emerald-400/50 focus:shadow-md focus:ring-2 focus:shadow-emerald-500/10 focus:ring-emerald-500/20 focus:outline-none"
        )}
        aria-label={t("searchLabel")}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full text-white/30 transition-colors duration-200 hover:text-white/60"
          aria-label={t("clearSearch")}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  )
}

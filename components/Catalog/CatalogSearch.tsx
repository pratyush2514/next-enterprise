"use client"

import { useTranslations } from "next-intl"

import { cn } from "lib/utils"

import { CloseIcon, SearchIcon } from "./icons"

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CatalogSearch({ value, onChange, className }: CatalogSearchProps) {
  const t = useTranslations("catalog")

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor="catalog-search" className="sr-only">
        {t("searchLabel")}
      </label>
      <SearchIcon className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
      <input
        id="catalog-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className={cn(
          "w-full rounded-full border border-gray-200 bg-white py-3 pr-11 pl-11 text-sm",
          "shadow-sm transition-all duration-300",
          "placeholder:text-gray-400",
          "focus:border-emerald-400 focus:shadow-md focus:ring-2 focus:shadow-emerald-500/10 focus:ring-emerald-500/20 focus:outline-none",
          "dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500",
          "dark:focus:border-emerald-500/50 dark:focus:shadow-emerald-500/5"
        )}
        aria-label={t("searchLabel")}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className={cn(
            "absolute top-1/2 right-3.5 -translate-y-1/2 rounded-full p-0.5",
            "text-gray-400 transition-colors duration-200 hover:text-gray-600",
            "dark:text-gray-500 dark:hover:text-gray-300"
          )}
          aria-label={t("clearSearch")}
          type="button"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  )
}

"use client"

import { cn } from "lib/utils"

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CatalogSearch({ value, onChange, className }: CatalogSearchProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor="catalog-search" className="sr-only">
        Search music catalog
      </label>
      <svg
        className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        id="catalog-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for music..."
        className={cn(
          "w-full rounded-full border border-gray-200 bg-white py-3 pr-11 pl-11 text-sm",
          "shadow-sm transition-all duration-300",
          "placeholder:text-gray-400",
          "focus:border-emerald-400 focus:shadow-md focus:ring-2 focus:shadow-emerald-500/10 focus:ring-emerald-500/20 focus:outline-none",
          "dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500",
          "dark:focus:border-emerald-500/50 dark:focus:shadow-emerald-500/5"
        )}
        aria-label="Search for music"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className={cn(
            "absolute top-1/2 right-3.5 -translate-y-1/2 rounded-full p-0.5",
            "text-gray-400 transition-colors duration-200 hover:text-gray-600",
            "dark:text-gray-500 dark:hover:text-gray-300"
          )}
          aria-label="Clear search"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

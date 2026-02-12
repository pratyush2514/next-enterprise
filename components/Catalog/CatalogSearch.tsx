"use client"

import { cn } from "lib/utils"

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CatalogSearch({ value, onChange, className }: CatalogSearchProps) {
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <label htmlFor="catalog-search" className="sr-only">
        Search iTunes catalog
      </label>
      <svg
        className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
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
          "w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-10 pl-10 text-sm",
          "placeholder:text-gray-400",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
          "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
        )}
        aria-label="Search for music on iTunes"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Clear search"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

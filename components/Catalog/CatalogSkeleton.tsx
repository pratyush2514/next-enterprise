import { cn } from "lib/utils"

export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white",
            "dark:border-gray-700 dark:bg-gray-800"
          )}
          aria-hidden="true"
        >
          <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </>
  )
}

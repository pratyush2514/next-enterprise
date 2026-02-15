import { cn } from "lib/utils"

export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse overflow-hidden rounded-xl border border-gray-200/80 bg-white",
            "shadow-sm dark:border-gray-800 dark:bg-gray-900"
          )}
          aria-hidden="true"
        >
          <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
          <div className="space-y-2.5 p-3.5">
            <div className="h-4 w-3/4 rounded-full bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-1/2 rounded-full bg-gray-100 dark:bg-gray-800" />
            <div className="h-3 w-2/3 rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </>
  )
}

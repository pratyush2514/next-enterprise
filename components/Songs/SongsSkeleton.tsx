import { cn } from "lib/utils"

export function SongsSkeleton({ count = 10 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-gray-900"
          )}
          aria-hidden="true"
        >
          <div className="aspect-square bg-gray-200 dark:bg-white/5" />
          <div className="space-y-2.5 p-3.5">
            <div className="h-4 w-3/4 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="h-3 w-1/2 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="h-3 w-2/3 rounded-full bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </>
  )
}

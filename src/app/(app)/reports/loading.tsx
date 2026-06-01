import { Skeleton } from '@/components/ui/skeleton'

export default function ReportsLoading() {
  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-7">
        <Skeleton className="h-7 w-28 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      {/* Filter bar */}
      <div className="flex gap-3 mb-5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>
      {/* List */}
      <div className="bg-surface border border-border/50 rounded-xl overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-border/20 last:border-0"
          >
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1.5" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-10 rounded-full" />
              <Skeleton className="h-3 w-20 hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

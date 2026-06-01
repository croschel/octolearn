import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border/50 rounded-xl p-4">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div>
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="grid sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface border border-border/50 rounded-xl p-4">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-1 w-full mb-3" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border/50 rounded-xl p-4">
            <Skeleton className="h-12 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="bg-surface border border-border/50 rounded-xl">
            <div className="px-4 py-3 border-b border-border/50">
              <Skeleton className="h-4 w-32" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24 mb-1.5" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

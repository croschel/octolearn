import { Skeleton } from '@/components/ui/skeleton'

export default function ReportLoading() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      {/* Score hero skeleton */}
      <div className="bg-surface border border-border/50 rounded-2xl p-8 mb-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-36 h-36 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex justify-center gap-8 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface border border-border/50 rounded-2xl p-6 mb-4">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  )
}

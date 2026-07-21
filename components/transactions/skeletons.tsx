import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

/** Theme-safe skeleton surface (never zinc/gray hardcodes). */
function Bone({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Skeleton
      className={cn('bg-bg-subtle animate-pulse', className)}
      {...props}
    />
  )
}

export function TransactionRowSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 px-2 py-3', className)}>
      <Bone className="h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex justify-between gap-4">
          <Bone className="h-4 w-28" />
          <Bone className="h-4 w-20" />
        </div>
        <Bone className="h-3 w-40" />
      </div>
    </div>
  )
}

export function TransactionListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-1" aria-busy aria-label="Loading transactions">
      {Array.from({ length: rows }).map((_, i) => (
        <TransactionRowSkeleton key={i} />
      ))}
    </div>
  )
}

export function MonthSummarySkeleton() {
  return (
    <div
      className="rounded-xl border border-border bg-bg-surface p-4"
      aria-busy
      aria-label="Loading summary"
    >
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-3 w-14" />
            <Bone className="h-6 w-full" />
          </div>
        ))}
      </div>
      <Bone className="mt-4 h-1.5 w-full rounded-full" />
    </div>
  )
}

export function CategoryPillsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2" aria-busy>
      {Array.from({ length: 6 }).map((_, i) => (
        <Bone key={i} className="h-10 w-24 rounded-full" />
      ))}
    </div>
  )
}

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

function Bone({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Skeleton
      className={cn('bg-bg-subtle animate-pulse', className)}
      {...props}
    />
  )
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading analytics">
      <div className="space-y-2">
        <Bone className="h-8 w-40" />
        <Bone className="h-4 w-64" />
      </div>

      <IncomeExpenseSkeleton />
      <CategoryBreakdownSkeleton />
      <MonthComparisonSkeleton />
      <TopCategoriesSkeleton />
      <MoneyLeaksSkeleton />
      <DailyTrendSkeleton />
    </div>
  )
}

export function IncomeExpenseSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5',
        className
      )}
      aria-busy
      aria-label="Loading income vs expenses"
    >
      <Bone className="mb-4 h-5 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Bone className="h-24 rounded-lg" />
        <Bone className="h-24 rounded-lg" />
        <Bone className="h-24 rounded-lg" />
      </div>
    </div>
  )
}

export function CategoryBreakdownSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5',
        className
      )}
      aria-busy
      aria-label="Loading spending breakdown"
    >
      <Bone className="mb-4 h-5 w-48" />
      <Bone className="mb-4 h-48 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="h-8 w-8 rounded-full" />
            <Bone className="h-4 flex-1" />
            <Bone className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonthComparisonSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5',
        className
      )}
      aria-busy
      aria-label="Loading month-over-month comparison"
    >
      <Bone className="mb-4 h-5 w-48" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Bone className="h-32 rounded-lg" />
        <Bone className="h-32 rounded-lg" />
      </div>
    </div>
  )
}

export function TopCategoriesSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5',
        className
      )}
      aria-busy
      aria-label="Loading top categories"
    >
      <Bone className="mb-4 h-5 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="h-6 w-6 rounded-full" />
            <Bone className="h-4 flex-1" />
            <Bone className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MoneyLeaksSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5',
        className
      )}
      aria-busy
      aria-label="Loading money leaks"
    >
      <Bone className="mb-4 h-5 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Bone key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function DailyTrendSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5',
        className
      )}
      aria-busy
      aria-label="Loading daily trend"
    >
      <Bone className="mb-4 h-5 w-48" />
      <Bone className="h-56 w-full rounded-lg" />
    </div>
  )
}

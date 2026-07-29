import { Skeleton } from '@/components/ui/skeleton'

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
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

export function IncomeExpenseSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5">
      <Skeleton className="mb-4 h-5 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    </div>
  )
}

export function CategoryBreakdownSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5">
      <Skeleton className="mb-4 h-5 w-48" />
      <Skeleton className="mb-4 h-48 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonthComparisonSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5">
      <Skeleton className="mb-4 h-5 w-48" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  )
}

export function TopCategoriesSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5">
      <Skeleton className="mb-4 h-5 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MoneyLeaksSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5">
      <Skeleton className="mb-4 h-5 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function DailyTrendSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5">
      <Skeleton className="mb-4 h-5 w-48" />
      <Skeleton className="h-56 w-full rounded-lg" />
    </div>
  )
}

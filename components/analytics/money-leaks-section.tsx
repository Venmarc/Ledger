'use client'

import { CheckCircle2 } from 'lucide-react'
import { useMoneyLeaks } from '@/lib/hooks'
import { SectionShell } from '@/components/analytics/section-shell'
import { ErrorState } from '@/components/analytics/error-state'
import { EmptyState } from '@/components/analytics/empty-state'
import { MoneyLeaksSkeleton } from '@/components/analytics/skeletons'
import { CategoryIcon } from '@/components/categories/category-icon'
import { cn, formatNGN } from '@/lib/utils'

function GreenCheck({ className }: { className?: string }) {
  return <CheckCircle2 className={cn(className, 'text-green')} />
}

export function MoneyLeaksSection({
  monthKey,
  className,
}: {
  monthKey: string
  className?: string
}) {
  const {
    data: leaks,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
    isFetching,
  } = useMoneyLeaks(monthKey)

  // keepPreviousData can hold last month's MoneyLeak[] while this month's
  // (possibly null — no budgets) result is in flight. Without this guard the
  // section briefly shows stale leak cards before snapping to hidden.
  if (isLoading || (isPlaceholderData && isFetching)) {
    return <MoneyLeaksSkeleton className={className} />
  }
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load money leaks'}
        onRetry={refetch}
        className={className}
      />
    )
  }

  // null (no active budgets) or undefined (query hasn't resolved yet) → hidden.
  // Empty array is truthy and falls through to the "no leaks" empty state below.
  if (!leaks) return null

  return (
    <SectionShell title="Money Leaks" className={className}>
      {leaks.length === 0 ? (
        <EmptyState
          icon={GreenCheck}
          title="No consistent overspending detected."
          description="Your budgets are holding steady."
        />
      ) : (
        <div className="space-y-3">
          {leaks.map((leak) => (
            <div
              key={leak.category.id}
              className="rounded-lg border border-border bg-bg-subtle/50 p-3"
            >
              <div className="flex items-center gap-3">
                <CategoryIcon iconName={leak.category.icon} size="sm" />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                  {leak.category.name}
                </p>
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                Over budget for{' '}
                <span className="font-semibold text-text-primary">
                  {leak.monthsOverBudget}
                </span>{' '}
                months in a row.
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Avg overspend:{' '}
                <span className="font-semibold tabular-nums text-red">
                  {formatNGN(leak.averageOverspend)}
                </span>
                /month
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

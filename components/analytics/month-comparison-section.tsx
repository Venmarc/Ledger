'use client'

import { useMonthComparison } from '@/lib/hooks'
import { SectionShell } from '@/components/analytics/section-shell'
import { ErrorState } from '@/components/analytics/error-state'
import { MonthComparisonSkeleton } from '@/components/analytics/skeletons'
import { CategoryIcon } from '@/components/categories/category-icon'
import { formatNGN, cn } from '@/lib/utils'
import { formatMonthLabel } from '@/lib/dates'

function TotalCard({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="rounded-lg border border-border bg-bg-subtle/50 p-4 text-center">
      <p className="text-xs font-medium text-text-tertiary">{label}</p>
      <p className="mt-1 font-display text-xl font-bold tabular-nums text-text-primary">
        {formatNGN(amount)}
      </p>
    </div>
  )
}

export function MonthComparisonSection({
  monthKey,
  className,
}: {
  monthKey: string
  className?: string
}) {
  const {
    data: comparison,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
    isFetching,
  } = useMonthComparison(monthKey)

  // keepPreviousData can hold last month's non-null comparison while this
  // month's (possibly null) result is in flight — treat that as loading so
  // the section doesn't flash stale content before hiding/updating.
  if (isLoading || (isPlaceholderData && isFetching)) {
    return <MonthComparisonSkeleton className={className} />
  }
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load month comparison'}
        onRetry={refetch}
        className={className}
      />
    )
  }

  if (!comparison) return null

  const deltaAbs = Math.abs(comparison.delta)
  const isMore = comparison.delta > 0
  const isLess = comparison.delta < 0

  return (
    <SectionShell title="vs Last Month" className={className}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TotalCard
          label={`${formatMonthLabel(comparison.currentMonthKey)} expenses`}
          amount={comparison.currentTotal}
        />
        <TotalCard
          label={`${formatMonthLabel(comparison.previousMonthKey)} expenses`}
          amount={comparison.previousTotal}
        />
      </div>

      <p
        className={cn(
          'mt-4 text-sm font-medium',
          isMore ? 'text-red' : isLess ? 'text-green' : 'text-text-secondary'
        )}
      >
        {isMore ? '▲' : isLess ? '▼' : '—'} {formatNGN(deltaAbs)}{' '}
        {isMore ? 'more' : isLess ? 'less' : 'same as'} last month
        {comparison.previousTotal > 0 && (isMore || isLess)
          ? ` (${isMore ? '+' : ''}${Math.round(comparison.deltaPercent * 100)}%)`
          : comparison.previousTotal === 0
            ? ' (no prior spending)'
            : ''}
      </p>

      <div className="mt-4 space-y-2">
        {comparison.perCategory.map((row) => (
          <div key={row.category.id} className="flex items-center gap-3">
            <CategoryIcon iconName={row.category.icon} size="sm" />
            <p className="min-w-0 flex-1 truncate text-sm text-text-primary">
              {row.category.name}
            </p>
            <p className="text-xs tabular-nums text-text-secondary">
              {formatNGN(row.currentAmount)}
            </p>
            <p className="text-xs tabular-nums text-text-tertiary">
              {formatNGN(row.previousAmount)}
            </p>
            <p
              className={cn(
                'w-16 text-right text-xs font-medium tabular-nums',
                row.delta > 0 ? 'text-red' : row.delta < 0 ? 'text-green' : 'text-text-secondary'
              )}
            >
              {row.delta > 0 ? '+' : ''}
              {formatNGN(row.delta)}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

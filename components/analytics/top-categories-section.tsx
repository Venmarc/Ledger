'use client'

import { useCategoryBreakdown } from '@/lib/hooks'
import { SectionShell } from '@/components/analytics/section-shell'
import { ErrorState } from '@/components/analytics/error-state'
import { TopCategoriesSkeleton } from '@/components/analytics/skeletons'
import { CategoryIcon } from '@/components/categories/category-icon'
import { formatNGN } from '@/lib/utils'

export function TopCategoriesSection({
  monthKey,
  className,
}: {
  monthKey: string
  className?: string
}) {
  // Same query key as CategoryBreakdownSection — TanStack Query dedupes to a
  // single network request. Do not lift this into props; both sections read
  // independently on purpose (PAGE_SPECS §10 "sections load independently").
  const {
    data: breakdown,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
    isFetching,
  } = useCategoryBreakdown(monthKey)

  if (isLoading || (isPlaceholderData && isFetching)) {
    return <TopCategoriesSkeleton className={className} />
  }
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load top categories'}
        onRetry={refetch}
        className={className}
      />
    )
  }

  const topFive = (breakdown ?? []).slice(0, 5)
  if (topFive.length === 0) return null

  return (
    <SectionShell title="Top 5 this month" className={className}>
      <ol className="space-y-3">
        {topFive.map((item, index) => (
          <li key={item.category.id} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-xs font-semibold text-text-secondary">
              {index + 1}
            </span>
            <CategoryIcon iconName={item.category.icon} size="sm" />
            <p className="min-w-0 flex-1 truncate text-sm text-text-primary">
              {item.category.name}
            </p>
            <p className="text-sm font-semibold tabular-nums text-text-primary">
              {formatNGN(item.amount)}
            </p>
            <p className="w-12 text-right text-xs tabular-nums text-text-secondary">
              {Math.round(item.percentOfTotal * 100)}%
            </p>
          </li>
        ))}
      </ol>
    </SectionShell>
  )
}

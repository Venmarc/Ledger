'use client'

import { useMonthIncomeExpense, useMonthSummary } from '@/lib/hooks'
import { SectionShell } from '@/components/analytics/section-shell'
import { ErrorState } from '@/components/analytics/error-state'
import { IncomeExpenseSkeleton } from '@/components/analytics/skeletons'
import { formatNGN, cn } from '@/lib/utils'

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: number
  valueClassName?: string
}) {
  return (
    <div>
      <p className="text-xs font-medium text-text-tertiary">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-2xl font-bold tabular-nums md:text-3xl',
          valueClassName
        )}
      >
        {formatNGN(value)}
      </p>
    </div>
  )
}

export function IncomeExpenseSection({
  monthKey,
  className,
}: {
  monthKey: string
  className?: string
}) {
  const { data, isLoading, isError, error, refetch } = useMonthIncomeExpense(monthKey)
  const { data: summary } = useMonthSummary(monthKey)

  if (isLoading) return <IncomeExpenseSkeleton className={className} />
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load income vs expenses'}
        onRetry={refetch}
        className={className}
      />
    )
  }

  const income = data?.income ?? 0
  const expense = data?.expense ?? 0
  const balance = summary?.balance ?? income - expense

  return (
    <SectionShell title="Income vs Expenses" className={className}>
      <div className="grid grid-cols-2 gap-4">
        <Metric label="Income" value={income} valueClassName="text-green" />
        <Metric label="Expenses" value={expense} valueClassName="text-red" />
      </div>
      <div className="mt-4 border-t border-border pt-4">
        <Metric
          label="Balance"
          value={balance}
          valueClassName={balance >= 0 ? 'text-green' : 'text-red'}
        />
      </div>
    </SectionShell>
  )
}

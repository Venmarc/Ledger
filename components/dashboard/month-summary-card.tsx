'use client'

import type { ReactNode } from 'react'
import { useMonthSummary } from '@/lib/hooks/use-transactions'
import { MonthSummarySkeleton } from '@/components/transactions/skeletons'
import { cn, formatNGN } from '@/lib/utils'

type Props = {
  monthKey: string
}

export function MonthSummaryCard({ monthKey }: Props) {
  const { data, isLoading, isError, error, refetch } = useMonthSummary(monthKey)

  if (isLoading) {
    return <MonthSummarySkeleton />
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red/40 bg-red-muted px-4 py-6 text-center">
        <p className="text-sm text-red">
          {error instanceof Error
            ? error.message
            : 'Could not load summary. Retry.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 min-h-11 text-sm font-semibold text-azure cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  const income = data?.income ?? 0
  const expense = data?.expense ?? 0
  const balance = data?.balance ?? 0
  const carriedIn = data?.carriedIn ?? 0
  const ratio = data?.expenseRatio ?? 0
  // Cap visual bar at 100%; overspend shown via red track end
  const barPct = Math.min(100, Math.round(ratio * 100))
  // Funds available this month = new income plus whatever carried over from
  // prior months — a positive carried-in balance is real money and must
  // count toward health, not just this month's income.
  const available = income + carriedIn
  const overspent = available - expense < 0
  const balanceIndicator: ReactNode =
    carriedIn === 0 ? null : (
      <span className={carriedIn > 0 ? 'text-green' : 'text-red'}>
        {carriedIn > 0 ? '▲' : '▼'}<span className="hidden md:inline">&nbsp;previous</span>
      </span>
    )

  return (
    <section
      className="entrance-blur-in rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5"
      aria-label="Month summary"
    >
      <div className="grid grid-cols-3 gap-3">
        <Metric
          label="Income"
          value={formatNGN(income)}
          className="text-green"
        />
        <Metric
          label="Expenses"
          value={formatNGN(expense)}
          className="text-amber"
        />
        <Metric
          label="Balance"
          value={formatNGN(balance)}
          className={balance >= 0 ? 'text-green' : 'text-red'}
          indicator={balanceIndicator}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle"
          role="meter"
          aria-valuenow={barPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Expenses as percent of income"
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-300 ease-out',
              overspent ? 'bg-red' : 'bg-azure'
            )}
            style={{ width: `${barPct}%` }}
          />
        </div>
        <p className="text-xs text-text-tertiary">
          {available > 0
            ? overspent
              ? `Spending over available funds by ${formatNGN(Math.abs(available - expense))}`
              : carriedIn > 0 && income === 0
                ? `${formatNGN(expense)} of ${formatNGN(available)} available spent (${formatNGN(carriedIn)} carried over)`
                : `${formatNGN(expense)} of ${formatNGN(available)} available spent this month`
            : expense > 0
              ? 'Spending with no income or balance available'
              : 'No activity this month'}
        </p>
      </div>
    </section>
  )
}

function Metric({
  label,
  value,
  className,
  indicator,
}: {
  label: string
  value: string
  className?: string
  indicator?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-xs font-medium text-text-tertiary">
        <span>{label}</span>
        {indicator}
      </p>
      <p
        className={cn(
          'mt-1 truncate text-base font-semibold tabular-nums md:text-lg',
          className
        )}
      >
        {value}
      </p>
    </div>
  )
}

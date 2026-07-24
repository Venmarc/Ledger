'use client'

import { budgetRemainingTextClass } from '@/lib/progress'
import type { BudgetMonthSummary } from '@/lib/types/database'
import { cn, formatNGN } from '@/lib/utils'

type Props = {
  summary: BudgetMonthSummary
  className?: string
}

export function BudgetSummaryBar({ summary, className }: Props) {
  const remainingClass = budgetRemainingTextClass(
    summary.totalBudgeted,
    summary.remaining
  )

  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5',
        className
      )}
      aria-label="Budget summary"
    >
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Budgeted" value={formatNGN(summary.totalBudgeted)} />
        <Metric label="Spent" value={formatNGN(summary.totalSpent)} />
        <Metric
          label="Remaining"
          value={formatNGN(summary.remaining)}
          valueClassName={remainingClass}
        />
      </div>
    </section>
  )
}

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="min-w-0 text-center sm:text-left">
      <p className="text-xs font-medium text-text-tertiary">{label}</p>
      <p
        className={cn(
          'mt-1 truncate font-display text-base font-semibold tabular-nums text-text-primary sm:text-lg',
          valueClassName
        )}
      >
        {value}
      </p>
    </div>
  )
}

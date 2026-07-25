'use client'

import { CategoryIcon } from '@/components/categories/category-icon'
import { ProgressBar } from '@/components/shared/progress-bar'
import { isOverBudget, remainingAmount } from '@/lib/progress'
import type { BudgetWithActual } from '@/lib/types/database'
import { cn, formatNGN } from '@/lib/utils'

type Props = {
  budget: BudgetWithActual
  /** When true, card is a button that opens edit. Past month → false. */
  interactive: boolean
  onEdit?: () => void
  className?: string
}

export function BudgetCard({ budget, interactive, onEdit, className }: Props) {
  const name = budget.categories?.name ?? 'Category'
  const over = isOverBudget(budget.limit, budget.actual)
  const rem = remainingAmount(budget.limit, budget.actual)

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CategoryIcon iconName={budget.categories?.icon} />
          <p className="truncate text-sm font-medium text-text-primary">{name}</p>
        </div>
        <p className="shrink-0 text-xs tabular-nums text-text-tertiary">
          {formatNGN(budget.limit)}
        </p>
      </div>

      <ProgressBar
        ratio={budget.ratio}
        label={`${name} budget`}
        className="mt-3"
      />

      <div className="mt-2 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-xs text-text-secondary">
          <span className="tabular-nums">{formatNGN(budget.actual)}</span>
          {' spent of '}
          <span className="tabular-nums">{formatNGN(budget.limit)}</span>
        </p>
        <p
          className={cn(
            'text-xs font-medium tabular-nums',
            over ? 'text-red' : 'text-text-secondary'
          )}
        >
          {over
            ? `${formatNGN(Math.abs(budget.actual - budget.limit))} over`
            : `${formatNGN(rem)} remaining`}
        </p>
      </div>
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className={cn(
          'pressable w-full rounded-xl border border-border bg-bg-surface p-4 text-left shadow-card',
          'transition-[border-color,box-shadow] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
          'hover:border-border-strong hover:shadow-elevated',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
          'cursor-pointer',
          className
        )}
        aria-label={`Edit ${name} budget`}
      >
        {body}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-bg-surface p-4 shadow-card',
        className
      )}
    >
      {body}
    </div>
  )
}

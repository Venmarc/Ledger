'use client'

import Link from 'next/link'
import { BudgetCard } from '@/components/budgets/budget-card'
import { BudgetCardSkeleton } from '@/components/budgets/skeletons'
import { useBudgetsMonth } from '@/lib/hooks'

type Props = {
  monthKey: string
}

/** PAGE_SPECS §PAGE 4 — Budget Health. Up to 4 cards, overspent first. */
export function BudgetHealth({ monthKey }: Props) {
  const { data, isLoading, isError, error, refetch } = useBudgetsMonth(monthKey)

  const budgets = data?.budgets ?? []
  const top4 = budgets.slice(0, 4)

  return (
    <section
      className="space-y-3"
      aria-label="Budget health"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Budgets
        </h2>
        <Link
          href="/budgets"
          className="min-h-10 inline-flex items-center text-sm font-medium text-azure hover:underline"
        >
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
          aria-busy
          aria-label="Loading budgets"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <BudgetCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div
          className="rounded-xl border border-red/40 bg-red-muted px-4 py-6 text-center"
          role="alert"
        >
          <p className="text-sm text-red">
            {error instanceof Error
              ? error.message
              : 'Could not load budgets. Retry.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 min-h-11 text-sm font-semibold text-azure cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && budgets.length === 0 ? (
        <div className="entrance-blur-in rounded-xl border border-dashed border-border bg-bg-surface/50 px-4 py-8 text-center">
          <p className="text-sm text-text-secondary">No budgets set.</p>
          <Link
            href="/budgets"
            className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-azure hover:underline"
          >
            Add a budget →
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && budgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {top4.map((b) => (
            <BudgetCard key={b.id} budget={b} interactive={false} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

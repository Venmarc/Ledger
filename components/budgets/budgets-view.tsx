'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { MonthSelector } from '@/components/dashboard/month-selector'
import { BudgetSummaryBar } from '@/components/budgets/budget-summary-bar'
import { BudgetCard } from '@/components/budgets/budget-card'
import {
  BudgetFormSheet,
  type BudgetFormMode,
} from '@/components/budgets/budget-form-sheet'
import {
  BudgetListSkeleton,
  BudgetSummarySkeleton,
} from '@/components/budgets/skeletons'
import { SecondaryButton } from '@/components/transactions/primary-button'
import { useBudgetsMonth, useCategoriesByType } from '@/lib/hooks'
import { currentMonthKey, formatMonthLabel } from '@/lib/dates'
import type { BudgetWithActual } from '@/lib/types/database'

export function BudgetsView() {
  const [monthKey, setMonthKey] = React.useState(currentMonthKey)
  const isCurrentMonth = monthKey === currentMonthKey()

  const { data, isLoading, isError, error, refetch } = useBudgetsMonth(monthKey)
  const { categories: expenseCategories } = useCategoriesByType('expense')

  const budgets = data?.budgets ?? []
  const summary = data?.summary ?? {
    totalBudgeted: 0,
    totalSpent: 0,
    remaining: 0,
  }

  const budgetedIds = React.useMemo(
    () => new Set(budgets.map((b) => b.category_id)),
    [budgets]
  )

  const unbudgetedCategories = React.useMemo(
    () => expenseCategories.filter((c) => !budgetedIds.has(c.id)),
    [expenseCategories, budgetedIds]
  )

  const [formMode, setFormMode] = React.useState<BudgetFormMode | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)

  const openCreate = () => {
    setFormMode({ kind: 'create', monthKey })
    setFormOpen(true)
  }

  const openEdit = (budget: BudgetWithActual) => {
    setFormMode({ kind: 'edit', budget })
    setFormOpen(true)
  }

  const monthLabel = formatMonthLabel(monthKey)
  const allCategoriesBudgeted =
    expenseCategories.length > 0 && unbudgetedCategories.length === 0

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col items-start gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 w-full lg:flex-1">
          <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
            Budgets
          </h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Monthly category spending limits.
          </p>
        </div>
        <MonthSelector
          monthKey={monthKey}
          onChange={setMonthKey}
          className="shrink-0 self-start"
        />
      </header>

      {isLoading ? (
        <>
          <BudgetSummarySkeleton />
          <BudgetListSkeleton />
        </>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red/40 bg-red-muted px-4 py-6 text-center">
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

      {!isLoading && !isError ? (
        <>
          {budgets.length > 0 ? <BudgetSummaryBar summary={summary} /> : null}

          {budgets.length === 0 ? (
            <div className="entrance-blur-in rounded-xl border border-dashed border-border bg-bg-surface/50 px-4 py-10 text-center">
              <p className="text-sm text-text-secondary">
                {isCurrentMonth
                  ? `No budgets set for ${monthLabel}. Add your first budget below.`
                  : `No budgets were set for ${monthLabel}.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {budgets.map((b) => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  interactive={isCurrentMonth}
                  onEdit={isCurrentMonth ? () => openEdit(b) : undefined}
                />
              ))}
            </div>
          )}

          {isCurrentMonth ? (
            allCategoriesBudgeted ? (
              <p className="text-center text-sm text-text-tertiary">
                All categories have budgets this month.
              </p>
            ) : (
              <SecondaryButton
                type="button"
                onClick={openCreate}
                className="gap-2"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add Budget
              </SecondaryButton>
            )
          ) : null}
        </>
      ) : null}

      <BudgetFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setFormMode(null)
        }}
        mode={formMode}
        unbudgetedCategories={unbudgetedCategories}
      />
    </div>
  )
}

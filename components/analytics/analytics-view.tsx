'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import { MonthSelector } from '@/components/dashboard/month-selector'
import { CategoryBreakdownSection } from '@/components/analytics/category-breakdown-section'
import { IncomeExpenseSection } from '@/components/analytics/income-expense-section'
import { MonthComparisonSection } from '@/components/analytics/month-comparison-section'
import { TopCategoriesSection } from '@/components/analytics/top-categories-section'
import { MoneyLeaksSection } from '@/components/analytics/money-leaks-section'
import { DailyTrendSection } from '@/components/analytics/daily-trend-section'
import { useMonthIncomeExpense } from '@/lib/hooks'
import { currentMonthKey } from '@/lib/dates'
import { INSIGHT_TRANSACTION_THRESHOLD } from '@/lib/analytics'

export function AnalyticsView() {
  const [monthKey, setMonthKey] = React.useState(currentMonthKey)
  const { data: incomeExpense, isError: incomeExpenseError } =
    useMonthIncomeExpense(monthKey)

  // incomeExpense stays undefined while loading or on error — the banner
  // simply doesn't render in either case (IncomeExpenseSection shows its own
  // skeleton/error card independently).
  const showInsightBanner =
    !incomeExpenseError &&
    incomeExpense !== undefined &&
    incomeExpense.count < INSIGHT_TRANSACTION_THRESHOLD

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <header className="flex flex-col items-start gap-3 lg:col-span-2 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="min-w-0 w-full lg:flex-1">
            <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
              Analytics
            </h1>
            <p className="mt-0.5 text-sm text-text-secondary">
              Charts and spending insights for your Naira.
            </p>
          </div>
          <MonthSelector
            monthKey={monthKey}
            onChange={setMonthKey}
            className="shrink-0 self-start"
          />
        </header>

        {showInsightBanner ? (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-surface p-4 shadow-card lg:col-span-2">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-azure" aria-hidden />
            <p className="text-sm text-text-secondary">
              Add more transactions to unlock full insights.
            </p>
          </div>
        ) : null}

        <CategoryBreakdownSection monthKey={monthKey} className="lg:col-span-1" />
        <IncomeExpenseSection monthKey={monthKey} className="lg:col-span-1" />
        <MonthComparisonSection monthKey={monthKey} className="lg:col-span-2" />
        <TopCategoriesSection monthKey={monthKey} className="lg:col-span-2" />
        <MoneyLeaksSection monthKey={monthKey} className="lg:col-span-2" />
        <DailyTrendSection monthKey={monthKey} className="lg:col-span-2" />
      </div>
    </div>
  )
}

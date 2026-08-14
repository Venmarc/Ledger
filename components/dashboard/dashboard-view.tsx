'use client'

import * as React from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { MonthSummaryCard } from '@/components/dashboard/month-summary-card'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { BudgetHealth } from '@/components/dashboard/budget-health'
import { GoalsPreview } from '@/components/dashboard/goals-preview'
import { RecurringDueBanner } from '@/components/dashboard/recurring-due-banner'
import { currentMonthKey } from '@/lib/dates'

/**
 * Dashboard (PHASES.md Phase 2 + 3):
 * greeting, month selector, recurring due banner, month summary, recent 8,
 * budget health (up to 4 cards bound to month picker),
 * goals preview (up to 3 active goals). Recent is always latest.
 * Key Insight deferred (not in Phase 3 scope).
 */
export default function DashboardView() {
  const [monthKey, setMonthKey] = React.useState(currentMonthKey)

  return (
    <div className="space-y-6 md:space-y-8">
      <DashboardHeader monthKey={monthKey} onMonthChange={setMonthKey} />

      <RecurringDueBanner />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="space-y-6 lg:col-span-3">
          <MonthSummaryCard monthKey={monthKey} />
          <RecentTransactions />
        </div>
        <aside className="space-y-6 lg:col-span-2">
          <BudgetHealth monthKey={monthKey} />
          <GoalsPreview />
        </aside>
      </div>
    </div>
  )
}
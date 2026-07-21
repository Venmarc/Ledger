'use client'

import * as React from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { MonthSummaryCard } from '@/components/dashboard/month-summary-card'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { currentMonthKey } from '@/lib/dates'

/**
 * Dashboard v1 (PHASES.md Phase 1 only):
 * greeting, month selector, month summary, recent 8.
 * Budget / goals / insight / recurring deferred to later phases.
 */
export default function DashboardPage() {
  const [monthKey, setMonthKey] = React.useState(currentMonthKey)

  return (
    <div className="space-y-6 md:space-y-8">
      <DashboardHeader monthKey={monthKey} onMonthChange={setMonthKey} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="space-y-6 lg:col-span-3">
          <MonthSummaryCard monthKey={monthKey} />
          <RecentTransactions />
        </div>
        {/* Phase 2 slots: budgets / insight / goals sit here later */}
        <aside className="hidden lg:col-span-2 lg:block">
          <div className="rounded-xl border border-dashed border-border bg-bg-surface/50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-text-secondary">
              Budgets & goals
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Coming in Phase 2 — keep logging transactions.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

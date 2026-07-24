'use client'

import * as React from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { GoalCard } from '@/components/goals/goal-card'
import { GoalFormSheet } from '@/components/goals/goal-form-sheet'
import { GoalListSkeleton } from '@/components/goals/skeletons'
import { SecondaryButton } from '@/components/transactions/primary-button'
import { useGoals } from '@/lib/hooks/use-goals'
import { formatNGN } from '@/lib/utils'

export function GoalsView() {
  const activeQuery = useGoals('active')
  const archivedQuery = useGoals('archived')

  const activeGoals = activeQuery.data ?? []
  const archivedGoals = archivedQuery.data ?? []

  const [createOpen, setCreateOpen] = React.useState(false)
  const [completedOpen, setCompletedOpen] = React.useState(false)

  const totalSavedActive = React.useMemo(
    () => activeGoals.reduce((sum, g) => sum + g.current, 0),
    [activeGoals]
  )

  const isLoading = activeQuery.isLoading
  const isError = activeQuery.isError
  const error = activeQuery.error

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
            Goals
          </h1>
          {activeGoals.length > 0 ? (
            <p className="mt-0.5 text-sm text-text-secondary">
              {formatNGN(totalSavedActive)} saved across {activeGoals.length}{' '}
              {activeGoals.length === 1 ? 'active goal' : 'active goals'}.
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-text-secondary">
              Track and reach your savings milestones.
            </p>
          )}
        </div>
        {!isLoading && !isError ? (
          <SecondaryButton
            type="button"
            onClick={() => setCreateOpen(true)}
            className="gap-2 sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New Goal
          </SecondaryButton>
        ) : null}
      </header>

      {isLoading ? <GoalListSkeleton count={3} /> : null}

      {isError ? (
        <div className="rounded-xl border border-red/40 bg-red-muted px-4 py-6 text-center">
          <p className="text-sm text-red">
            {error instanceof Error ? error.message : 'Could not load savings goals.'}
          </p>
          <button
            type="button"
            onClick={() => void activeQuery.refetch()}
            className="mt-3 min-h-11 cursor-pointer text-sm font-semibold text-azure"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <>
          {activeGoals.length === 0 ? (
            <div className="entrance-blur-in rounded-xl border border-dashed border-border bg-bg-surface/50 px-4 py-10 text-center">
              <p className="text-sm text-text-secondary">
                No active goals. Create your first one to start tracking.
              </p>
              <SecondaryButton
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mx-auto mt-4 gap-2 w-auto"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Create Goal
              </SecondaryButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}

          {archivedGoals.length > 0 ? (
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCompletedOpen((prev) => !prev)}
                className="pressable flex items-center justify-between w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                <span>Completed / Archived ({archivedGoals.length})</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)] ${
                    completedOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>

              <div
                className="reveal-grid"
                data-open={completedOpen ? 'true' : 'false'}
              >
                <div className="reveal-grid-inner pt-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                    {archivedGoals.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} muted />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <GoalFormSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

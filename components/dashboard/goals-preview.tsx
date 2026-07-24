'use client'

import Link from 'next/link'
import { ProgressRing } from '@/components/shared/progress-ring'
import { GoalCardSkeleton } from '@/components/goals/skeletons'
import { useGoals } from '@/lib/hooks/use-goals'
import { formatGoalTargetLabel } from '@/lib/dates'
import { ratioToPercent } from '@/lib/progress'
import { cn, formatNGN } from '@/lib/utils'
import type { SavingsGoalView } from '@/lib/types/database'

/** PAGE_SPECS §PAGE 4 — Goals Preview. Up to 3 active (non-completed) goals. */
export function GoalsPreview() {
  const { data, isLoading, isError, error, refetch } = useGoals('active')

  const activeGoals = (data ?? []).filter((g) => !g.isCompleted)
  const top3 = activeGoals.slice(0, 3)

  return (
    <section className="space-y-3" aria-label="Savings goals preview">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Goals
        </h2>
        <Link
          href="/goals"
          className="min-h-10 inline-flex items-center text-sm font-medium text-azure hover:underline"
        >
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 gap-3 lg:grid-cols-1"
          aria-busy
          aria-label="Loading savings goals"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <GoalCardSkeleton key={i} />
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
              : 'Could not load goals. Retry.'}
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

      {!isLoading && !isError && top3.length === 0 ? (
        <div className="entrance-blur-in rounded-xl border border-dashed border-border bg-bg-surface/50 px-4 py-8 text-center">
          <p className="text-sm text-text-secondary">No savings goals.</p>
          <Link
            href="/goals"
            className="mt-1 inline-flex min-h-10 items-center text-sm font-semibold text-azure hover:underline"
          >
            Create one →
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && top3.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-1 lg:overflow-visible">
          {top3.map((goal) => (
            <MiniGoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function MiniGoalCard({ goal }: { goal: SavingsGoalView }) {
  const targetLabel = formatGoalTargetLabel(goal.target_date)
  const toneClass =
    targetLabel?.tone === 'red'
      ? 'text-red'
      : targetLabel?.tone === 'amber'
      ? 'text-amber'
      : 'text-text-tertiary'
  const percent = ratioToPercent(goal.ratio)

  return (
    <Link
      href={`/goals/${goal.id}`}
      aria-label={`${goal.title} — ${Math.min(percent, 999)}% saved`}
      className={cn(
        'pressable flex min-w-[220px] shrink-0 items-center gap-3 rounded-xl border border-border bg-bg-surface p-3 shadow-card',
        'transition-[background-color,transform] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
        'hover:bg-bg-elevated',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
        'lg:min-w-0 lg:w-full'
      )}
    >
      <div className="shrink-0">
        <ProgressRing ratio={goal.ratio} size={48} showLabel={false} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {goal.title}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium tabular-nums text-text-primary">
          {formatNGN(goal.current)}{' '}
          <span className="font-normal text-text-tertiary">
            / {formatNGN(goal.target)}
          </span>
        </p>
        {targetLabel ? (
          <p className={cn('mt-0.5 truncate text-xs', toneClass)}>
            {targetLabel.text}
          </p>
        ) : (
          <p className="mt-0.5 truncate text-xs text-text-tertiary">
            {Math.min(percent, 999)}% saved
          </p>
        )}
      </div>
    </Link>
  )
}

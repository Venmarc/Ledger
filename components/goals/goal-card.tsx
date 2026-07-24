'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { SavingsGoalView } from '@/lib/types/database'
import { formatNGN } from '@/lib/utils'
import { formatGoalTargetLabel } from '@/lib/dates'
import { ProgressRing } from '@/components/shared/progress-ring'
import { ProgressBar } from '@/components/shared/progress-bar'

type Props = {
  goal: SavingsGoalView
  /** dimmed for archived / completed section */
  muted?: boolean
  className?: string
}

export function GoalCard({ goal, muted, className }: Props) {
  const targetLabel = formatGoalTargetLabel(goal.target_date)

  const toneClass =
    targetLabel?.tone === 'red'
      ? 'text-red'
      : targetLabel?.tone === 'amber'
      ? 'text-amber'
      : 'text-text-tertiary'

  return (
    <Link
      href={`/goals/${goal.id}`}
      className={cn(
        'pressable block rounded-xl border border-border bg-bg-surface p-4 shadow-card',
        muted && 'opacity-70',
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <h3 className="w-full truncate text-base font-semibold text-text-primary">
          {goal.title}
        </h3>

        {targetLabel ? (
          <p className={cn('mt-0.5 text-xs font-medium', toneClass)}>
            {targetLabel.text}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-text-tertiary">No target date</p>
        )}

        <div className="my-4 flex items-center justify-center">
          <ProgressRing
            ratio={goal.ratio}
            size={80}
          />
        </div>

        <div className="text-sm font-semibold tabular-nums text-text-primary">
          {formatNGN(goal.current)}{' '}
          <span className="font-normal text-text-tertiary">
            / {formatNGN(goal.target)}
          </span>
        </div>

        <div className="mt-4 w-full">
          <ProgressBar
            ratio={goal.ratio}
            variant="goal"
            label={`${goal.title} progress`}
          />
        </div>
      </div>
    </Link>
  )
}

'use client'

import { cn } from '@/lib/utils'
import {
  barWidthPercent,
  budgetFillClass,
  goalBarFillClass,
  clampRatio,
  ratioToPercent,
} from '@/lib/progress'
import { prefersReducedMotion } from '@/lib/motion'

type ProgressBarProps = {
  /** actual / limit */
  ratio: number
  variant?: 'budget' | 'goal'
  className?: string
  /** Accessible name, e.g. "Transport budget" */
  label?: string
}

export function ProgressBar({
  ratio,
  variant = 'budget',
  className,
  label,
}: ProgressBarProps) {
  const safe = clampRatio(ratio)
  const width = barWidthPercent(safe)
  const percent = ratioToPercent(safe)
  const fill = variant === 'goal' ? goalBarFillClass(safe) : budgetFillClass(safe)
  const reduce = prefersReducedMotion()

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.min(100, percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle',
        className
      )}
    >
      <div
        className={cn('h-full rounded-full', fill)}
        style={{
          width: `${width}%`,
          transition: reduce
            ? undefined
            : 'width var(--duration-slow) var(--ease-smooth)',
        }}
      />
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import {
  clampRatio,
  goalFillClass,
  ratioToPercent,
} from '@/lib/progress'
import { prefersReducedMotion } from '@/lib/motion'

type ProgressRingProps = {
  ratio: number
  size?: number
  labelSize?: 'sm' | 'lg'
  className?: string
  showLabel?: boolean
}

export function ProgressRing({
  ratio,
  size = 80,
  labelSize = 'sm',
  className,
  showLabel = true,
}: ProgressRingProps) {
  const safe = clampRatio(ratio)
  const percent = ratioToPercent(safe)
  const visual = Math.min(1, safe)
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - visual)
  const colorClass = goalFillClass(safe)
  const reduce = prefersReducedMotion()

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.min(100, percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          style={{ stroke: 'var(--color-border)' }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(colorClass, 'stroke-current')}
          style={{
            transition: reduce
              ? undefined
              : 'stroke-dashoffset var(--duration-slow) var(--ease-smooth)',
          }}
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            'absolute font-semibold tabular-nums text-text-primary',
            labelSize === 'lg' ? 'text-lg' : 'text-sm'
          )}
        >
          {Math.min(percent, 999)}%
        </span>
      )}
    </div>
  )
}

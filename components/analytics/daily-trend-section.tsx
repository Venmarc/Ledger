'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useDailyTrend } from '@/lib/hooks'
import { SectionShell } from '@/components/analytics/section-shell'
import { ErrorState } from '@/components/analytics/error-state'
import { DailyTrendSkeleton } from '@/components/analytics/skeletons'
import { ChartTooltip } from '@/components/analytics/chart-tooltip'
import { CHART_COLORS } from '@/lib/analytics'
import { formatMonthLabel } from '@/lib/dates'

export function DailyTrendSection({
  monthKey,
  className,
}: {
  monthKey: string
  className?: string
}) {
  const {
    data: points,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
    isFetching,
  } = useDailyTrend(monthKey)

  if (isLoading || (isPlaceholderData && isFetching)) {
    return <DailyTrendSkeleton className={className} />
  }
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load daily trend'}
        onRetry={refetch}
        className={className}
      />
    )
  }

  const allZero = !points || points.every((p) => p.amount === 0)
  if (allZero) return null

  return (
    <SectionShell
      title={`Daily spending — ${formatMonthLabel(monthKey)}`}
      className={className}
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.1} />
              <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="dayLabel"
            tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₦${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <Tooltip content={(props) => <ChartTooltip {...props} />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            fill="url(#trendFill)"
            activeDot={{ r: 4, fill: CHART_COLORS[0] }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </SectionShell>
  )
}

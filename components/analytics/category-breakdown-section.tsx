'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  type YAxisTickContentProps,
} from 'recharts'
import { useCategoryBreakdown } from '@/lib/hooks'
import { SectionShell } from '@/components/analytics/section-shell'
import { ErrorState } from '@/components/analytics/error-state'
import { EmptyState } from '@/components/analytics/empty-state'
import { CategoryBreakdownSkeleton } from '@/components/analytics/skeletons'
import { ChartTooltip } from '@/components/analytics/chart-tooltip'
import { CategoryIcon } from '@/components/categories/category-icon'
import { breakdownToChartData } from '@/lib/analytics'
import { formatNGN } from '@/lib/utils'
import { formatMonthLabel } from '@/lib/dates'
import { PieChart } from 'lucide-react'

const Y_AXIS_LABEL_MAX = 12

/**
 * SVG <text> ticks clip rather than CSS-truncate — Recharts default YAxis tick
 * won't add an ellipsis on overflow, so long category names disappear at the
 * axis boundary. Truncate in JS instead.
 */
function truncateAxisLabel(value: string): string {
  return value.length > Y_AXIS_LABEL_MAX
    ? `${value.slice(0, Y_AXIS_LABEL_MAX - 1)}…`
    : value
}

function CategoryAxisTick({ x, y, payload }: YAxisTickContentProps) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={12}
      fill="var(--color-text-secondary)"
    >
      {truncateAxisLabel(String(payload?.value ?? ''))}
    </text>
  )
}

export function CategoryBreakdownSection({
  monthKey,
  className,
}: {
  monthKey: string
  className?: string
}) {
  const { data: items, isLoading, isError, error, refetch } = useCategoryBreakdown(monthKey)

  if (isLoading) return <CategoryBreakdownSkeleton className={className} />
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load category breakdown'}
        onRetry={refetch}
        className={className}
      />
    )
  }

  const breakdown = items ?? []

  if (breakdown.length === 0) {
    return (
      <SectionShell title="Where your money went" className={className}>
        <EmptyState
          icon={PieChart}
          title={`No expense transactions for ${formatMonthLabel(monthKey)}.`}
        />
      </SectionShell>
    )
  }

  const chartData = breakdownToChartData(breakdown)

  return (
    <SectionShell title="Where your money went" className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tick={CategoryAxisTick}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip content={(props) => <ChartTooltip {...props} />} />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {breakdown.map((item) => (
          <div key={item.category.id} className="flex items-center gap-3">
            <CategoryIcon iconName={item.category.icon} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-text-primary">
                {item.category.name}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-text-primary">
              {formatNGN(item.amount)}
            </p>
            <p className="w-12 text-right text-xs tabular-nums text-text-secondary">
              {Math.round(item.percentOfTotal * 100)}%
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

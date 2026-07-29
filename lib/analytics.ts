/** Analytics display helpers. UIUX_BRIEF §9 chart colors. */

import type { CategoryBreakdown } from '@/lib/types/database'

/**
 * Ordered chart palette from UIUX_BRIEF §9.
 * Used for bar charts, pie charts, and category breakdowns.
 * These map to CSS custom properties or static hex values when CSS vars
 * cannot be resolved by the charting library.
 */
export const CHART_COLORS = [
  'var(--color-azure)', // #38BDF8
  'var(--color-orange)', // #F97316
  'var(--color-green)', // #22C55E
  '#A78BFA', // violet-400
  '#FB923C', // orange-400
  '#34D399', // emerald-400
] as const

/** Color for a category at a given index, cycling if needed. */
export function chartColorAt(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

/** Build Recharts-compatible data with color attached. */
export function breakdownToChartData(items: CategoryBreakdown[]) {
  return items.map((item, index) => ({
    name: item.category.name,
    amount: item.amount,
    percent: item.percentOfTotal,
    color: chartColorAt(index),
  }))
}

/** Empty analytics threshold per PAGE_SPECS: < 5 transactions hides deep insights. */
export const INSIGHT_TRANSACTION_THRESHOLD = 5

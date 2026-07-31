/** Analytics display helpers. UIUX_BRIEF §9 chart colors. */

import type { CategoryBreakdown } from '@/lib/types/database'

/**
 * Ordered chart palette from UIUX_BRIEF §9 "Chart Colors (Ordered by Usage Frequency)".
 * UIUX_BRIEF §9 lines 662-667 define this exact order and name the three
 * tertiary+ colors as raw hex literals (`#A78BFA`, `#FB923C`, `#34D399`) —
 * no CSS var is defined for them, so hex is the documented form, not an
 * arbitrary override. The first three DO have CSS vars and resolve correctly
 * inside Recharts `<Cell fill>` / `<Bar fill>` when the value is the resolved
 * hex string (Recharts does not reliably resolve `var(--…)` strings inside SVG
 * fill attributes — pass the literal).
 *
 * Values mirror the dark-mode token definitions in `app/globals.css`:
 *   --color-azure  = #38BDF8
 *   --color-orange = #F97316
 *   --color-green  = #22C55E
 *
 * Light-mode chart colors are NOT tokenized in Phase 3 — Phase 4 owns the
 * light-mode value refinement pass (PHASES.md §Phase 4). When Phase 4 lands,
 * these literals should be replaced with a `useChartColors()` hook that reads
 * resolved CSS vars at runtime. Until then, dark values are the chart palette.
 */
export const CHART_COLORS = [
  '#38BDF8', // azure   (--color-azure,   UIUX_BRIEF §9 #1 — primary spend category)
  '#F97316', // orange  (--color-orange,  UIUX_BRIEF §9 #2 — secondary series)
  '#22C55E', // green   (--color-green,   UIUX_BRIEF §9 #3 — income series)
  '#A78BFA', // violet  (UIUX_BRIEF §9 #4 — tertiary category, hex per spec)
  '#FB923C', // orange-400 (UIUX_BRIEF §9 #5 — quaternary)
  '#34D399', // emerald-400 (UIUX_BRIEF §9 #6 — quinary)
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

/** Budget / goal progress math and fill tokens. TRD + UIUX_BRIEF §6.6–6.7. */

/** TRD.md + UIUX_BRIEF §6.6 — budget warning at 75%. */
export const BUDGET_WARNING_THRESHOLD = 0.75

/** Clamp ratio to [0, +∞) for display math. */
export function clampRatio(ratio: number): number {
  if (!Number.isFinite(ratio) || ratio < 0) return 0
  return ratio
}

/** Percent integer for labels; can exceed 100 when over budget / over target. */
export function ratioToPercent(ratio: number): number {
  return Math.round(clampRatio(ratio) * 100)
}

/**
 * Budget bar fill token class (background).
 * 0–74% → bg-azure
 * 75–99% → bg-amber
 * 100%+ → bg-red
 * ratio is actual/limit (e.g. 0.75 = 75%).
 */
export function budgetFillClass(
  ratio: number
): 'bg-azure' | 'bg-amber' | 'bg-red' {
  const r = clampRatio(ratio)
  if (r >= 1) return 'bg-red'
  if (r >= BUDGET_WARNING_THRESHOLD) return 'bg-amber'
  return 'bg-azure'
}

/** Goal ring stroke token class (use with stroke-current / text-*). */
export function goalFillClass(ratio: number): 'text-azure' | 'text-green' {
  return clampRatio(ratio) >= 1 ? 'text-green' : 'text-azure'
}

/** Goal bar fill token class (background). */
export function goalBarFillClass(ratio: number): 'bg-azure' | 'bg-green' {
  return clampRatio(ratio) >= 1 ? 'bg-green' : 'bg-azure'
}

/** Width % for CSS bar, capped at 100 so overspend still fills the track. */
export function barWidthPercent(ratio: number): number {
  return Math.min(100, ratioToPercent(clampRatio(ratio)))
}

export function remainingAmount(limit: number, actual: number): number {
  return Math.round((limit - actual) * 100) / 100
}

/** true when actual > limit */
export function isOverBudget(limit: number, actual: number): boolean {
  return actual > limit
}

/**
 * Budget summary remaining color (PAGE_SPECS):
 * remaining > 25% of budgeted → green
 * remaining ≤ 25% and ≥ 0 → amber
 * remaining < 0 → red
 */
export function budgetRemainingTextClass(
  totalBudgeted: number,
  remaining: number
): 'text-green' | 'text-amber' | 'text-red' {
  if (remaining < 0) return 'text-red'
  if (totalBudgeted <= 0) return 'text-green'
  const fractionLeft = remaining / totalBudgeted
  if (fractionLeft > 0.25) return 'text-green'
  return 'text-amber'
}

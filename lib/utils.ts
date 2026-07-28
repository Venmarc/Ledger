import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function parseAmount(amount: number | string): number {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return Number.isFinite(value) ? value : 0
}

/** Full NGN with kobo (forms, toasts, exact totals). */
export function formatNGN(amount: number | string): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseAmount(amount))
}

/** NGN whole naira — no cents. Used on budget cards. */
export function formatNGNWhole(amount: number | string): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(parseAmount(amount)))
}

/** K-compact starts at 15k; below that stays full whole naira. */
export const NGN_K_COMPACT_MIN = 15_000
/** M-compact at 1M+. */
export const NGN_M_COMPACT_MIN = 1_000_000

function trimDecimals(n: number, maxDecimals: number): string {
  return n.toFixed(maxDecimals).replace(/\.?0+$/, '')
}

/**
 * Dashboard budget mini-card amounts.
 * - < 15,000 → full whole naira (no cents)
 * - 15,000–999,999 → K compact, 1 decimal when needed (₦15k, ₦15.1k)
 * - ≥ 1,000,000 → M compact, up to 2 decimals (₦1M, ₦1.23M)
 */
export function formatNGNCompact(amount: number | string): string {
  const n = parseAmount(amount)
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)

  if (abs < NGN_K_COMPACT_MIN) {
    return formatNGNWhole(n)
  }

  if (abs < NGN_M_COMPACT_MIN) {
    let k = Math.round((abs / 1000) * 10) / 10
    // Stay in K band visually when nearest would be 1000k
    if (k >= 1000) k = 999.9
    return `${sign}₦${trimDecimals(k, 1)}k`
  }

  const m = Math.round((abs / 1_000_000) * 100) / 100
  return `${sign}₦${trimDecimals(m, 2)}M`
}

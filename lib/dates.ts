import {
  addDays,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
} from 'date-fns'
import type { DateRangePreset } from '@/lib/types/database'

export const LAGOS_TZ = 'Africa/Lagos'

/** Calendar date YYYY-MM-DD in Africa/Lagos (not browser local). */
export function todayInLagos(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: LAGOS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Month key YYYY-MM for the current Lagos calendar month. */
export function currentMonthKey(now: Date = new Date()): string {
  return todayInLagos(now).slice(0, 7)
}

/** First day of month as YYYY-MM-DD from a month key (YYYY-MM) or any date string. */
export function monthStart(monthKeyOrDate: string): string {
  const key = monthKeyOrDate.slice(0, 7)
  return `${key}-01`
}

/** Last day of month YYYY-MM-DD for a month key (YYYY-MM). */
export function monthEnd(monthKey: string): string {
  const start = parseISO(monthStart(monthKey))
  return format(endOfMonth(start), 'yyyy-MM-dd')
}

/** Human month label e.g. "July 2026". */
export function formatMonthLabel(monthKey: string): string {
  const d = parseISO(monthStart(monthKey))
  return format(d, 'MMMM yyyy')
}

/**
 * Date group header for transaction lists.
 * Compares against Lagos "today" so headers stay correct for Nigerian users.
 */
export function formatDayHeader(dateStr: string, now: Date = new Date()): string {
  const today = todayInLagos(now)
  if (dateStr === today) return 'Today'

  const yesterday = format(
    addDays(parseISO(today), -1),
    'yyyy-MM-dd'
  )
  if (dateStr === yesterday) return 'Yesterday'

  return format(parseISO(dateStr), 'EEEE d MMM')
}

/** Short row date e.g. "Today", "Yesterday", "Mon 30 Jun". */
export function formatRowDate(dateStr: string, now: Date = new Date()): string {
  const today = todayInLagos(now)
  if (dateStr === today) return 'Today'
  const yesterday = format(addDays(parseISO(today), -1), 'yyyy-MM-dd')
  if (dateStr === yesterday) return 'Yesterday'
  return format(parseISO(dateStr), 'EEE d MMM')
}

/** delta: +1 next month, -1 previous month */
export function shiftMonthKey(monthKey: string, delta: number): string {
  const base = startOfMonth(parseISO(monthStart(monthKey)))
  const shifted = subMonths(base, -delta)
  return format(startOfMonth(shifted), 'yyyy-MM')
}

/** Inclusive date bounds for transaction list filters (YYYY-MM-DD). */
export function resolveDateRange(
  preset: DateRangePreset,
  customFrom: string | null,
  customTo: string | null,
  now: Date = new Date()
): { from: string; to: string } {
  const today = todayInLagos(now)
  const todayDate = parseISO(today)

  switch (preset) {
    case 'this_month':
      return {
        from: format(startOfMonth(todayDate), 'yyyy-MM-dd'),
        to: format(endOfMonth(todayDate), 'yyyy-MM-dd'),
      }
    case 'last_month': {
      const last = subMonths(todayDate, 1)
      return {
        from: format(startOfMonth(last), 'yyyy-MM-dd'),
        to: format(endOfMonth(last), 'yyyy-MM-dd'),
      }
    }
    case 'last_3_months': {
      const start = startOfMonth(subMonths(todayDate, 2))
      return {
        from: format(start, 'yyyy-MM-dd'),
        to: today,
      }
    }
    case 'this_year':
      return {
        from: format(startOfYear(todayDate), 'yyyy-MM-dd'),
        to: format(endOfYear(todayDate), 'yyyy-MM-dd'),
      }
    case 'custom':
      return {
        from: customFrom ?? format(startOfMonth(todayDate), 'yyyy-MM-dd'),
        to: customTo ?? today,
      }
    default:
      return {
        from: format(startOfMonth(todayDate), 'yyyy-MM-dd'),
        to: today,
      }
  }
}

import {
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionListFilters,
} from '@/lib/types/database'

export function isDefaultFilters(filters: TransactionListFilters): boolean {
  return (
    filters.dateRange === DEFAULT_TRANSACTION_FILTERS.dateRange &&
    filters.customFrom === null &&
    filters.customTo === null &&
    filters.type === 'all' &&
    filters.categoryIds.length === 0 &&
    filters.paymentMethod === 'all' &&
    filters.search.trim() === ''
  )
}

/** Sheet filters only — search lives in the control row, not the filter badge. */
export function isDefaultSheetFilters(
  filters: Pick<
    TransactionListFilters,
    'dateRange' | 'customFrom' | 'customTo' | 'type' | 'categoryIds' | 'paymentMethod'
  >
): boolean {
  return (
    filters.dateRange === DEFAULT_TRANSACTION_FILTERS.dateRange &&
    filters.customFrom === null &&
    filters.customTo === null &&
    filters.type === 'all' &&
    filters.categoryIds.length === 0 &&
    filters.paymentMethod === 'all'
  )
}

export function countActiveFilters(filters: TransactionListFilters): number {
  let n = countSheetFilters(filters)
  if (filters.search.trim()) n++
  return n
}

/** Active filters that belong on the filter icon badge + chip row. */
export function countSheetFilters(filters: TransactionListFilters): number {
  let n = 0
  if (
    filters.dateRange !== 'this_month' ||
    filters.customFrom ||
    filters.customTo
  )
    n++
  if (filters.type !== 'all') n++
  if (filters.categoryIds.length > 0) n++
  if (filters.paymentMethod !== 'all') n++
  return n
}

export const DATE_RANGE_LABELS: Record<
  TransactionListFilters['dateRange'],
  string
> = {
  this_month: 'This Month',
  last_month: 'Last Month',
  last_3_months: '3 Months',
  this_year: 'This Year',
  custom: 'Custom',
}

'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getCategoryBreakdown,
  getDailyTrend,
  getMoneyLeaks,
  getMonthComparison,
  getMonthIncomeExpense,
} from '@/lib/actions/analytics'
import { currentMonthKey } from '@/lib/dates'
import { queryKeys } from '@/lib/query-keys'

/** INCOME VS EXPENSES section. */
export function useMonthIncomeExpense(monthKey: string = currentMonthKey()) {
  return useQuery({
    queryKey: queryKeys.analytics.incomeExpense(monthKey),
    queryFn: async () => {
      const result = await getMonthIncomeExpense(monthKey)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    placeholderData: keepPreviousData,
  })
}

/** SPENDING BY CATEGORY + TOP SPENDING CATEGORIES (top-5 = breakdown.slice(0,5) in component). */
export function useCategoryBreakdown(monthKey: string = currentMonthKey()) {
  return useQuery({
    queryKey: queryKeys.analytics.breakdown(monthKey),
    queryFn: async () => {
      const result = await getCategoryBreakdown(monthKey)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    placeholderData: keepPreviousData,
  })
}

/** MONTH-OVER-MONTH. Returns null when not enough data — component hides section. */
export function useMonthComparison(monthKey: string = currentMonthKey()) {
  return useQuery({
    queryKey: queryKeys.analytics.comparison(monthKey),
    queryFn: async () => {
      const result = await getMonthComparison(monthKey)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    placeholderData: keepPreviousData,
  })
}

/** MONEY LEAKS. Component hides section when `data === null` (no active budgets). */
export function useMoneyLeaks(monthKey: string = currentMonthKey()) {
  return useQuery({
    queryKey: queryKeys.analytics.leaks(monthKey),
    queryFn: async () => {
      const result = await getMoneyLeaks(monthKey)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    placeholderData: keepPreviousData,
  })
}

/** DAILY TREND. Component hides section when month has no expense transactions. */
export function useDailyTrend(monthKey: string = currentMonthKey()) {
  return useQuery({
    queryKey: queryKeys.analytics.trend(monthKey),
    queryFn: async () => {
      const result = await getDailyTrend(monthKey)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    placeholderData: keepPreviousData,
  })
}

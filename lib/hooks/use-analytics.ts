'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getSpendingAnalytics } from '@/lib/actions/analytics'
import { currentMonthKey } from '@/lib/dates'
import { queryKeys } from '@/lib/query-keys'

export function useSpendingAnalytics(monthKey: string = currentMonthKey()) {
  return useQuery({
    queryKey: queryKeys.analytics.spending(monthKey),
    queryFn: async () => {
      const result = await getSpendingAnalytics(monthKey)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    placeholderData: keepPreviousData,
  })
}

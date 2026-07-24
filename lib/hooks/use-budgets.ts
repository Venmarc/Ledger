'use client'

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createBudget,
  deleteBudget,
  listBudgetsForMonth,
  updateBudget,
} from '@/lib/actions/budgets'
import { currentMonthKey } from '@/lib/dates'
import { queryKeys } from '@/lib/query-keys'
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
} from '@/lib/validations/budget'

function invalidateBudgets(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() })
}

/** Budgets + summary for a month (YYYY-MM). */
export function useBudgetsMonth(monthKey: string = currentMonthKey()) {
  return useQuery({
    queryKey: queryKeys.budgets.month(monthKey),
    queryFn: async () => {
      const result = await listBudgetsForMonth(monthKey)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    placeholderData: keepPreviousData,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      const result = await createBudget(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateBudgets(queryClient)
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateBudgetInput) => {
      const result = await updateBudget(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateBudgets(queryClient)
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBudget(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateBudgets(queryClient)
    },
  })
}

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  confirmRecurringTemplate,
  createRecurringTemplate,
  deleteRecurringTemplate,
  listDueRecurringTemplates,
  listRecurringTemplates,
  skipRecurringTemplate,
  updateRecurringTemplate,
} from '@/lib/actions/recurring'
import { queryKeys } from '@/lib/query-keys'
import type {
  CreateRecurringTemplateInput,
  UpdateRecurringTemplateInput,
} from '@/lib/validations/recurring'

function invalidateRecurring(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all() })
}

/**
 * Confirming/skipping advances next_date, so a template can move off the due
 * list; confirming also creates a real transaction, which affects budget
 * actuals, the month summary, and every analytics section.
 */
function invalidateAfterConfirm(
  queryClient: ReturnType<typeof useQueryClient>
) {
  invalidateRecurring(queryClient)
  void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() })
  void queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() })
  void queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() })
  void queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all() })
}

/** "All Templates" list — active-not-due + inactive (dimmed). */
export function useRecurringTemplates() {
  return useQuery({
    queryKey: queryKeys.recurring.list(),
    queryFn: async () => {
      const result = await listRecurringTemplates()
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
  })
}

/** "Due Now" list — active templates with next_date <= today. */
export function useDueRecurringTemplates() {
  return useQuery({
    queryKey: queryKeys.recurring.due(),
    queryFn: async () => {
      const result = await listDueRecurringTemplates()
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
  })
}

export function useCreateRecurringTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateRecurringTemplateInput) => {
      const result = await createRecurringTemplate(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateRecurring(queryClient)
    },
  })
}

export function useUpdateRecurringTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateRecurringTemplateInput) => {
      const result = await updateRecurringTemplate(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateRecurring(queryClient)
    },
  })
}

export function useDeleteRecurringTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteRecurringTemplate(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateRecurring(queryClient)
    },
  })
}

export function useConfirmRecurringTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await confirmRecurringTemplate(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateAfterConfirm(queryClient)
    },
  })
}

export function useSkipRecurringTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await skipRecurringTemplate(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateRecurring(queryClient)
    },
  })
}

'use client'

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  archiveCategory,
  createCategory,
  listCategories,
  renameCategory,
  restoreCategory,
} from '@/lib/actions/categories'
import { queryKeys } from '@/lib/query-keys'
import type { Category } from '@/lib/types/database'
import type {
  CreateCategoryInput,
  RenameCategoryInput,
} from '@/lib/validations/category'

export function useCategories(options?: { includeArchived?: boolean }) {
  const includeArchived = options?.includeArchived ?? false

  return useQuery({
    queryKey: includeArchived
      ? queryKeys.categories.archived()
      : queryKeys.categories.active(),
    queryFn: async () => {
      const result = await listCategories({ includeArchived })
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
  })
}

/** Active categories filtered by transaction type (Quick Add / forms). */
export function useCategoriesByType(type: 'income' | 'expense' | 'all' = 'all') {
  const query = useCategories({ includeArchived: false })
  const categories =
    type === 'all'
      ? query.data
      : query.data?.filter((c) => c.type === type)

  return { ...query, categories: categories ?? [] }
}

function invalidateCategoryQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const result = await createCategory(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.active(),
        (prev) => (prev ? [...prev, created] : [created])
      )
      invalidateCategoryQueries(queryClient)
    },
  })
}

export function useRenameCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RenameCategoryInput) => {
      const result = await renameCategory(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateCategoryQueries(queryClient)
      // Names show on transaction rows
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all(),
      })
    },
  })
}

export function useArchiveCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await archiveCategory(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateCategoryQueries(queryClient)
    },
  })
}

export function useRestoreCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await restoreCategory(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateCategoryQueries(queryClient)
    },
  })
}

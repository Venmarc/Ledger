'use client'

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import {
  createTransaction,
  deleteTransaction,
  getMonthSummary,
  getTransaction,
  listRecentTransactions,
  listTransactions,
  restoreTransaction,
  updateTransaction,
  type ListTransactionsResult,
} from '@/lib/actions/transactions'
import { currentMonthKey } from '@/lib/dates'
import { queryKeys } from '@/lib/query-keys'
import type {
  MonthSummary,
  TransactionListFilters,
  TransactionWithCategory,
} from '@/lib/types/database'
import type {
  CreateTransactionInput,
  RestoreTransactionInput,
  UpdateTransactionInput,
} from '@/lib/validations/transaction'

function invalidateTransactionReads(
  queryClient: ReturnType<typeof useQueryClient>
) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.transactions.all(),
  })
  void queryClient.invalidateQueries({ queryKey: queryKeys.summary.all() })
  // FAB-driven expense mutations must also refresh budget cards
  // (actuals are computed at query time from expense transactions).
  void queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() })
  void queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all() })
}

export function useInfiniteTransactions(filters: TransactionListFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions.infinite(filters),
    queryFn: async ({ pageParam }) => {
      const result = await listTransactions({
        filters,
        page: pageParam,
      })
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    // Keep showing previous results while a new filter/search hits the server
    // (avoids empty flash + feels less “slow” for already-visible rows).
    placeholderData: keepPreviousData,
  })
}

export function useRecentTransactions(limit = 8) {
  return useQuery({
    queryKey: queryKeys.transactions.recent(limit),
    queryFn: async () => {
      const result = await listRecentTransactions(limit)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    // Avoid full skeleton flash on remount / focus refetch
    placeholderData: keepPreviousData,
  })
}

export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null
      const result = await getTransaction(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
  })
}

export function useMonthSummary(monthKey: string = currentMonthKey()) {
  return useQuery({
    queryKey: queryKeys.summary.month(monthKey),
    queryFn: async () => {
      const result = await getMonthSummary(monthKey)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    // Keep previous month totals visible while the next month loads
    placeholderData: keepPreviousData,
  })
}

type InfiniteTx = InfiniteData<ListTransactionsResult>

function mapInfinite(
  data: InfiniteTx | undefined,
  mapFn: (item: TransactionWithCategory) => TransactionWithCategory | null
): InfiniteTx | undefined {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items
        .map(mapFn)
        .filter((x): x is TransactionWithCategory => x !== null),
    })),
  }
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const result = await createTransaction(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.transactions.all(),
      })

      // Optimistic recent prepend (minimal shape until server confirms)
      const optimistic: TransactionWithCategory = {
        id: `optimistic-${crypto.randomUUID()}`,
        user_id: '',
        category_id: input.category_id,
        amount: String(input.amount),
        type: input.type,
        transaction_date: input.transaction_date,
        description: input.description ?? null,
        notes: input.notes ?? null,
        payment_method: input.payment_method ?? null,
        tags: input.tags ?? null,
        recurring_id: input.recurring_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: null,
      }

      const previousRecent = queryClient.getQueryData<TransactionWithCategory[]>(
        queryKeys.transactions.recent(8)
      )

      queryClient.setQueryData<TransactionWithCategory[]>(
        queryKeys.transactions.recent(8),
        (old) => [optimistic, ...(old ?? [])].slice(0, 8)
      )

      return { previousRecent, optimisticId: optimistic.id }
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previousRecent) {
        queryClient.setQueryData(
          queryKeys.transactions.recent(8),
          ctx.previousRecent
        )
      }
    },
    onSuccess: (created, _input, ctx) => {
      // Replace optimistic row in recent
      queryClient.setQueryData<TransactionWithCategory[]>(
        queryKeys.transactions.recent(8),
        (old) => {
          if (!old) return [created]
          return [
            created,
            ...old.filter((t) => t.id !== ctx?.optimisticId),
          ].slice(0, 8)
        }
      )

      // Prepend into any loaded infinite lists
      queryClient.setQueriesData<InfiniteTx>(
        { queryKey: [...queryKeys.transactions.all(), 'infinite'] },
        (old) => {
          if (!old?.pages?.length) return old
          const [first, ...rest] = old.pages
          return {
            ...old,
            pages: [
              {
                ...first,
                items: [created, ...first.items],
                total: first.total !== null ? first.total + 1 : null,
              },
              ...rest,
            ],
          }
        }
      )

      invalidateTransactionReads(queryClient)
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateTransactionInput) => {
      const result = await updateTransaction(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKeys.transactions.detail(updated.id),
        updated
      )

      queryClient.setQueryData<TransactionWithCategory[]>(
        queryKeys.transactions.recent(8),
        (old) =>
          old?.map((t) => (t.id === updated.id ? updated : t)) ?? old
      )

      queryClient.setQueriesData<InfiniteTx>(
        { queryKey: [...queryKeys.transactions.all(), 'infinite'] },
        (old) =>
          mapInfinite(old, (item) =>
            item.id === updated.id ? updated : item
          )
      )

      invalidateTransactionReads(queryClient)
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      id: string
      /** Kept for undo restore */
      snapshot?: TransactionWithCategory
    }) => {
      const result = await deleteTransaction(payload.id)
      if (!result.ok) throw new Error(result.error)
      return { id: payload.id, snapshot: payload.snapshot }
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.transactions.all(),
      })

      const previousRecent = queryClient.getQueryData<TransactionWithCategory[]>(
        queryKeys.transactions.recent(8)
      )
      const previousInfinite = queryClient.getQueriesData<InfiniteTx>({
        queryKey: [...queryKeys.transactions.all(), 'infinite'],
      })

      queryClient.setQueryData<TransactionWithCategory[]>(
        queryKeys.transactions.recent(8),
        (old) => old?.filter((t) => t.id !== id)
      )

      queryClient.setQueriesData<InfiniteTx>(
        { queryKey: [...queryKeys.transactions.all(), 'infinite'] },
        (old) => mapInfinite(old, (item) => (item.id === id ? null : item))
      )

      return { previousRecent, previousInfinite }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousRecent) {
        queryClient.setQueryData(
          queryKeys.transactions.recent(8),
          ctx.previousRecent
        )
      }
      ctx?.previousInfinite?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSuccess: () => {
      invalidateTransactionReads(queryClient)
    },
  })
}

export function useRestoreTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RestoreTransactionInput) => {
      const result = await restoreTransaction(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: (restored) => {
      queryClient.setQueryData<TransactionWithCategory[]>(
        queryKeys.transactions.recent(8),
        (old) => [restored, ...(old ?? [])].slice(0, 8)
      )
      invalidateTransactionReads(queryClient)
    },
  })
}

export type { MonthSummary, TransactionWithCategory }

import type { TransactionListFilters } from '@/lib/types/database'

/** Stable TanStack Query key factory for Ledger server state. */
export const queryKeys = {
  all: ['ledger'] as const,

  categories: {
    all: () => [...queryKeys.all, 'categories'] as const,
    active: () => [...queryKeys.categories.all(), 'active'] as const,
    archived: () => [...queryKeys.categories.all(), 'archived'] as const,
  },

  transactions: {
    all: () => [...queryKeys.all, 'transactions'] as const,
    list: (filters: Partial<TransactionListFilters>) =>
      [...queryKeys.transactions.all(), 'list', filters] as const,
    infinite: (filters: Partial<TransactionListFilters>) =>
      [...queryKeys.transactions.all(), 'infinite', filters] as const,
    detail: (id: string) =>
      [...queryKeys.transactions.all(), 'detail', id] as const,
    recent: (limit = 8) =>
      [...queryKeys.transactions.all(), 'recent', limit] as const,
  },

  summary: {
    all: () => [...queryKeys.all, 'summary'] as const,
    month: (monthKey: string) =>
      [...queryKeys.summary.all(), 'month', monthKey] as const,
  },

  budgets: {
    all: () => [...queryKeys.all, 'budgets'] as const,
    /** monthKey = YYYY-MM (same convention as summary.month) */
    month: (monthKey: string) =>
      [...queryKeys.budgets.all(), 'month', monthKey] as const,
  },

  goals: {
    all: () => [...queryKeys.all, 'goals'] as const,
    list: (scope: 'active' | 'archived' | 'all' = 'active') =>
      [...queryKeys.goals.all(), 'list', scope] as const,
    detail: (id: string) => [...queryKeys.goals.all(), 'detail', id] as const,
  },
} as const

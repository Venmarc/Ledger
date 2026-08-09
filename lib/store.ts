import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createEmptyQuickAddDraft,
  DEFAULT_TRANSACTION_FILTERS,
  type PaymentMethod,
  type QuickAddDraft,
  type TransactionListFilters,
} from '@/lib/types/database'
import { todayInLagos } from '@/lib/dates'

/* -------------------------------------------------------------------------- */
/* Shell / UI — persisted layout prefs only                                    */
/* -------------------------------------------------------------------------- */

interface UIState {
  quickAddOpen: boolean
  setQuickAddOpen: (open: boolean) => void
  /** When set, edit sheet targets this transaction (isolated from Quick Add draft). */
  editingTransactionId: string | null
  setEditingTransactionId: (id: string | null) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  /** Session-only: recurring banner dismissed until next full reload. */
  recurringBannerDismissed: boolean
  setRecurringBannerDismissed: (dismissed: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      quickAddOpen: false,
      setQuickAddOpen: (open) => set({ quickAddOpen: open }),
      editingTransactionId: null,
      setEditingTransactionId: (id) => set({ editingTransactionId: id }),
      sidebarCollapsed: true,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      recurringBannerDismissed: false,
      setRecurringBannerDismissed: (dismissed) =>
        set({ recurringBannerDismissed: dismissed }),
    }),
    {
      name: 'ledger-ui-store',
      // Do not persist sheet open state or editing target across reloads
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

/* -------------------------------------------------------------------------- */
/* Quick Add draft — separate persist key (TRD §4.5). Never used for edit.     */
/* -------------------------------------------------------------------------- */

interface QuickAddDraftState {
  draft: QuickAddDraft
  /** True only when sheet opened onto an existing dirty draft (banner UX). */
  openedWithDraft: boolean
  setDraft: (patch: Partial<QuickAddDraft>) => void
  replaceDraft: (draft: QuickAddDraft) => void
  markDirty: () => void
  clearDraft: () => void
  /** Call on sheet open (event handler): keep dirty draft or seed fresh today. */
  ensureDraftForOpen: (defaultPaymentMethod?: PaymentMethod | null) => {
    restored: boolean
  }
}

export const useQuickAddDraftStore = create<QuickAddDraftState>()(
  persist(
    (set, get) => ({
      draft: createEmptyQuickAddDraft(todayInLagos()),
      openedWithDraft: false,
      setDraft: (patch) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...patch,
            isDirty: true,
          },
        })),
      replaceDraft: (draft) => set({ draft }),
      markDirty: () =>
        set((state) => ({ draft: { ...state.draft, isDirty: true } })),
      clearDraft: () =>
        set({
          draft: createEmptyQuickAddDraft(todayInLagos()),
          openedWithDraft: false,
        }),
      ensureDraftForOpen: (defaultPaymentMethod) => {
        const { draft } = get()
        if (draft.isDirty) {
          set({ openedWithDraft: true })
          return { restored: true }
        }
        set({
          draft: {
            ...createEmptyQuickAddDraft(todayInLagos()),
            payment_method: defaultPaymentMethod ?? null,
          },
          openedWithDraft: false,
        })
        return { restored: false }
      },
    }),
    {
      name: 'ledger-quick-add-draft',
      partialize: (state) => ({ draft: state.draft }),
    }
  )
)

/* -------------------------------------------------------------------------- */
/* Transaction filters — session (no localStorage). Isolated from draft.       */
/* -------------------------------------------------------------------------- */

interface TransactionFilterState {
  filters: TransactionListFilters
  setFilters: (patch: Partial<TransactionListFilters>) => void
  resetFilters: () => void
}

export const useTransactionFilterStore = create<TransactionFilterState>()(
  (set) => ({
    filters: { ...DEFAULT_TRANSACTION_FILTERS },
    setFilters: (patch) =>
      set((state) => ({
        filters: { ...state.filters, ...patch },
      })),
    resetFilters: () =>
      set({ filters: { ...DEFAULT_TRANSACTION_FILTERS } }),
  })
)

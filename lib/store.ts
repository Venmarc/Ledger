import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  quickAddOpen: boolean
  setQuickAddOpen: (open: boolean) => void
  categoryFilter: string[]
  setCategoryFilter: (filter: string[]) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      quickAddOpen: false,
      setQuickAddOpen: (open) => set({ quickAddOpen: open }),
      categoryFilter: [],
      setCategoryFilter: (filter) => set({ categoryFilter: filter }),
      sidebarCollapsed: true,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'ledger-ui-store',
    }
  )
)

'use client'

import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useQuickAddDraftStore, useUIStore } from '@/lib/store'

/**
 * Primary logging entry point. Hidden on Settings routes (APP_FLOW §3.3).
 */
export function QuickAddFab() {
  const pathname = usePathname()
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen)
  const ensureDraftForOpen = useQuickAddDraftStore((s) => s.ensureDraftForOpen)

  if (pathname === '/settings' || pathname.startsWith('/settings/')) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => {
        ensureDraftForOpen()
        setQuickAddOpen(true)
      }}
      className="fixed right-4 bottom-[80px] md:right-8 md:bottom-8 w-14 h-14 bg-orange text-orange-btn-text rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.3)] hover:bg-orange-hover hover:-translate-y-0.5 active:scale-95 transition-all duration-150 z-40 cursor-pointer"
      aria-label="Quick Add Transaction"
    >
      <Plus className="w-7 h-7" aria-hidden />
    </button>
  )
}

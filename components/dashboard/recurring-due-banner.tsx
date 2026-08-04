'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useDueRecurringTemplates } from '@/lib/hooks'
import { useUIStore } from '@/lib/store'

/** PAGE_SPECS §PAGE 4 / APP_FLOW §3.5 — dismissible per session, reappears next visit. */
export function RecurringDueBanner() {
  const { data, isLoading, isError } = useDueRecurringTemplates()
  const dismissed = useUIStore((s) => s.recurringBannerDismissed)
  const setDismissed = useUIStore((s) => s.setRecurringBannerDismissed)

  const count = data?.length ?? 0

  if (isLoading || isError || dismissed || count === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber/40 bg-amber-muted/40 px-4 py-3 shadow-card">
      <Link
        href="/recurring"
        className="pressable min-w-0 flex-1 text-sm font-medium text-text-primary hover:underline"
      >
        {count} recurring transaction{count === 1 ? '' : 's'} due. Review now →
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss recurring due banner"
        className="pressable inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-tertiary hover:text-text-primary"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}

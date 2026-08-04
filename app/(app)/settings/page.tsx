'use client'

import Link from 'next/link'
import { ChevronRight, Tags } from 'lucide-react'
import { CurrencyWidget } from '@/components/settings/currency-widget'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-text-primary md:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Profile, categories, and preferences. More options in later phases.
        </p>
      </div>

      <nav className="space-y-2" aria-label="Settings">
        <Link
          href="/settings/categories"
          className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-bg-surface px-4 py-3 transition-colors hover:bg-bg-elevated hover:border-border-strong"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-azure-muted text-azure">
            <Tags className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-primary">Categories</p>
            <p className="text-sm text-text-secondary">
              Add, rename, or archive expense and income categories
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" />
        </Link>
      </nav>

      <CurrencyWidget />
    </div>
  )
}

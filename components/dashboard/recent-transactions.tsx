'use client'

import Link from 'next/link'
import { TransactionListSkeleton, TransactionRow } from '@/components/transactions'
import { useRecentTransactions } from '@/lib/hooks/use-transactions'
import { useUIStore } from '@/lib/store'
import { useQuickAddDraftStore } from '@/lib/store'
import { ArrowDownRight } from 'lucide-react'

export function RecentTransactions() {
  const { data, isLoading, isError, error, refetch } = useRecentTransactions(8)
  const setEditingId = useUIStore((s) => s.setEditingTransactionId)
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen)
  const ensureDraftForOpen = useQuickAddDraftStore((s) => s.ensureDraftForOpen)

  return (
    <section className="space-y-3" aria-label="Recent transactions">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Recent
        </h2>
        <Link
          href="/transactions"
          className="min-h-10 inline-flex items-center text-sm font-medium text-azure hover:underline"
        >
          View all →
        </Link>
      </div>

      {isLoading ? <TransactionListSkeleton rows={6} /> : null}

      {isError ? (
        <div className="rounded-xl border border-red/40 bg-red-muted px-4 py-6 text-center">
          <p className="text-sm text-red">
            {error instanceof Error
              ? error.message
              : 'Could not load transactions. Retry.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 min-h-11 text-sm font-semibold text-azure cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
        <div className="relative rounded-xl border border-border bg-bg-surface px-4 py-10 text-center">
          <p className="font-medium text-text-primary">No transactions yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Tap + to add your first.
          </p>
          <button
            type="button"
            onClick={() => {
              ensureDraftForOpen()
              setQuickAddOpen(true)
            }}
            className="mt-4 min-h-11 rounded-lg bg-orange px-5 text-sm font-semibold text-orange-btn-text hover:bg-orange-hover cursor-pointer"
          >
            Log expense
          </button>
          <div
            className="pointer-events-none absolute bottom-3 right-4 flex flex-col items-center text-orange md:hidden"
            aria-hidden
          >
            <ArrowDownRight className="h-6 w-6 animate-bounce" />
          </div>
        </div>
      ) : null}

      {!isLoading && !isError && data && data.length > 0 ? (
        <ul className="divide-y divide-border/60 rounded-xl border border-border bg-bg-surface px-1">
          {data.map((tx) => (
            <li key={tx.id}>
              <TransactionRow
                transaction={tx}
                showDate
                onClick={() => setEditingId(tx.id)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

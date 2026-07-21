'use client'

import * as React from 'react'
import { formatDayHeader } from '@/lib/dates'
import { isDefaultFilters } from '@/lib/filters'
import { useInfiniteTransactions } from '@/lib/hooks/use-transactions'
import { useTransactionFilterStore, useUIStore } from '@/lib/store'
import type { TransactionWithCategory } from '@/lib/types/database'
import {
  TransactionDateHeader,
  TransactionListSkeleton,
  TransactionRow,
} from '@/components/transactions'
import { RowActionsMenu } from '@/components/transactions/row-actions-menu'
import { SwipeableRow } from '@/components/transactions/swipeable-row'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useDeleteWithUndo } from '@/lib/hooks/use-delete-with-undo'
import { cn, formatNGN } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

function flattenPages(
  pages: { items: TransactionWithCategory[] }[] | undefined
): TransactionWithCategory[] {
  if (!pages) return []
  return pages.flatMap((p) => p.items)
}

function groupByDate(items: TransactionWithCategory[]) {
  const groups: { date: string; items: TransactionWithCategory[] }[] = []
  let current: { date: string; items: TransactionWithCategory[] } | null = null

  for (const tx of items) {
    if (!current || current.date !== tx.transaction_date) {
      current = { date: tx.transaction_date, items: [] }
      groups.push(current)
    }
    current.items.push(tx)
  }
  return groups
}

export function TransactionList() {
  const filters = useTransactionFilterStore((s) => s.filters)
  const resetFilters = useTransactionFilterStore((s) => s.resetFilters)
  const setEditingTransactionId = useUIStore((s) => s.setEditingTransactionId)
  const { deleteWithUndo, isDeleting } = useDeleteWithUndo()

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isFetching,
  } = useInfiniteTransactions(filters)

  const items = React.useMemo(
    () => flattenPages(data?.pages),
    [data?.pages]
  )
  const groups = React.useMemo(() => groupByDate(items), [items])
  const total = data?.pages[0]?.total ?? null
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  const [menu, setMenu] = React.useState<{
    tx: TransactionWithCategory
    x: number
    y: number
  } | null>(null)
  const [deleteTarget, setDeleteTarget] =
    React.useState<TransactionWithCategory | null>(null)

  React.useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return <TransactionListSkeleton rows={8} />
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red/40 bg-red-muted px-4 py-8 text-center">
        <p className="text-sm font-medium text-red">
          {error instanceof Error
            ? error.message
            : 'Could not load transactions.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 min-h-11 rounded-lg border border-red px-4 text-sm font-semibold text-red hover:bg-red hover:text-white transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    if (isDefaultFilters(filters)) {
      return (
        <div className="entrance-blur-in rounded-xl border border-border bg-bg-surface px-4 py-12 text-center shadow-card">
          <p className="font-medium text-text-primary">No transactions yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Tap + to log your first expense.
          </p>
        </div>
      )
    }

    return (
      <div className="entrance-blur-in rounded-xl border border-border bg-bg-surface px-4 py-12 text-center shadow-card">
        <p className="font-medium text-text-primary">
          No transactions match your filters.
        </p>
        <button
          type="button"
          onClick={() => resetFilters()}
          className="pressable mt-4 min-h-11 rounded-lg bg-orange px-5 text-sm font-semibold text-orange-btn-text shadow-card hover:bg-orange-hover cursor-pointer"
        >
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'tx-list-scroll space-y-1',
        // Prefer opacity for list refresh (Rule 9) — no blur on long lists
        'transition-opacity duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
        isFetching && !isFetchingNextPage && 'opacity-70'
      )}
      aria-busy={isFetching && !isFetchingNextPage}
    >
      {groups.map((group, gi) => (
        <section
          key={group.date}
          aria-label={formatDayHeader(group.date)}
          className={gi < 4 ? 'entrance-blur-in' : undefined}
          style={
            gi < 4
              ? { animationDelay: `${gi * 40}ms` }
              : undefined
          }
        >
          <TransactionDateHeader label={formatDayHeader(group.date)} />
          <ul className="divide-y divide-border/60">
            {group.items.map((tx) => (
              <li key={tx.id}>
                <SwipeableRow onDeleteRequest={() => setDeleteTarget(tx)}>
                  <TransactionRow
                    transaction={tx}
                    onClick={() => setEditingTransactionId(tx.id)}
                    onMenuClick={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      setMenu({
                        tx,
                        x: rect.left,
                        y: rect.bottom + 4,
                      })
                    }}
                  />
                </SwipeableRow>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div ref={sentinelRef} className="h-4" aria-hidden />

      {isFetchingNextPage ? (
        <div className="flex justify-center py-4 text-text-tertiary">
          <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading more" />
        </div>
      ) : null}

      {!hasNextPage ? (
        <p className="py-4 text-center text-xs text-text-tertiary">
          All {total ?? items.length} transaction
          {(total ?? items.length) === 1 ? '' : 's'} loaded.
        </p>
      ) : null}

      {menu ? (
        <RowActionsMenu
          transaction={menu.tx}
          anchor={{ x: menu.x, y: menu.y }}
          onClose={() => setMenu(null)}
          onDeleteRequest={(tx) => {
            setDeleteTarget(tx)
            setMenu(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete transaction?"
        description={
          deleteTarget
            ? `Delete this ${formatNGN(deleteTarget.amount)} ${deleteTarget.categories?.name ?? 'this'} transaction? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => {
          if (!deleteTarget) return
          void deleteWithUndo(deleteTarget).then(() => setDeleteTarget(null))
        }}
      />
    </div>
  )
}

export function TransactionListHeader() {
  const filters = useTransactionFilterStore((s) => s.filters)
  const { data, isLoading } = useInfiniteTransactions(filters)
  const total = data?.pages[0]?.total

  return (
    <div className="flex items-end justify-between gap-3">
      <h1 className="text-2xl font-bold font-display text-text-primary md:text-3xl">
        Transactions
      </h1>
      <p className="pb-0.5 text-sm tabular-nums text-text-secondary">
        {isLoading
          ? '…'
          : total === null || total === undefined
            ? ''
            : `${total} transaction${total === 1 ? '' : 's'}`}
      </p>
    </div>
  )
}

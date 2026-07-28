'use client'

import { cn, formatNGN } from '@/lib/utils'
import { formatDateLabel, formatRowDateShort } from '@/lib/dates'
import type { TransactionWithCategory } from '@/lib/types/database'
import { CategoryIcon } from '@/components/categories/category-icon'
import { MoreHorizontal } from 'lucide-react'

type TransactionRowProps = {
  transaction: TransactionWithCategory
  onClick?: () => void
  /** Show compact date under category (dashboard recent) */
  showDate?: boolean
  /** Desktop ⋮ menu trigger */
  onMenuClick?: (e: React.MouseEvent) => void
  className?: string
}

/**
 * Shared row for list + dashboard recent.
 * PAGE_SPECS: icon circle, name, description, amount by type, payment method.
 */
export function TransactionRow({
  transaction,
  onClick,
  showDate = false,
  onMenuClick,
  className,
}: TransactionRowProps) {
  const isIncome = transaction.type === 'income'
  const categoryName = transaction.categories?.name ?? 'Uncategorized'
  const amount = formatNGN(transaction.amount)
  const signed = isIncome ? `+${amount}` : `−${amount}`

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'group relative flex items-center gap-3 rounded-lg border border-transparent px-2 py-3',
        'transition-[background-color,transform] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
        onClick &&
          'pressable cursor-pointer hover:bg-bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
        className
      )}
    >
      {/* Type indicator bar */}
      <span
        className={cn(
          'absolute left-0 top-3 bottom-3 w-0.5 rounded-full',
          isIncome ? 'bg-green' : 'bg-amber'
        )}
        aria-hidden
      />

      <CategoryIcon iconName={transaction.categories?.icon} size="sm" />

      <div className="min-w-0 flex-1 pl-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-medium text-text-primary">{categoryName}</p>
          <p
            className={cn(
              'shrink-0 font-semibold tabular-nums',
              isIncome ? 'text-green' : 'text-text-primary'
            )}
          >
            <span className="sr-only">
              {isIncome ? 'Income' : 'Expense'}{' '}
            </span>
            {signed}
          </p>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-sm text-text-tertiary">
            {transaction.description?.trim() || '—'}
          </p>
          {showDate ? (
            <time
              dateTime={transaction.transaction_date}
              aria-label={formatDateLabel(transaction.transaction_date)}
              className="shrink-0 tabular-nums text-xs font-medium text-text-tertiary sm:ml-auto"
            >
              {formatRowDateShort(transaction.transaction_date)}
            </time>
          ) : null}
          {transaction.payment_method ? (
            <span className="hidden shrink-0 rounded-md border border-border bg-bg-subtle px-1.5 py-0.5 text-[11px] font-medium text-text-secondary sm:inline">
              {transaction.payment_method}
            </span>
          ) : null}
        </div>
      </div>

      {onMenuClick ? (
        <button
          type="button"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100 hover:bg-bg-subtle hover:text-text-primary md:flex cursor-pointer"
          aria-label="Transaction actions"
          onClick={(e) => {
            e.stopPropagation()
            onMenuClick(e)
          }}
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  )
}

export function TransactionDateHeader({ label }: { label: string }) {
  return (
    <div className="sticky top-0 z-10 bg-bg-base/95 px-2 py-2 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </p>
    </div>
  )
}

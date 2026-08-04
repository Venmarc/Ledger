'use client'

import { CategoryIcon } from '@/components/categories/category-icon'
import { formatRecurringDueLabel } from '@/lib/dates'
import { cn, formatNGN } from '@/lib/utils'
import type { RecurringTemplateWithCategory } from '@/lib/types/database'

type Props = {
  template: RecurringTemplateWithCategory
  onConfirm: () => void
  onSkip: () => void
  confirmLoading?: boolean
  skipLoading?: boolean
}

export function DueRow({
  template,
  onConfirm,
  onSkip,
  confirmLoading,
  skipLoading,
}: Props) {
  const name = template.categories?.name ?? 'Category'
  const due = formatRecurringDueLabel(template.next_date)
  const busy = confirmLoading || skipLoading

  return (
    <div className="rounded-xl border border-amber/40 bg-amber-muted/40 p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <CategoryIcon iconName={template.categories?.icon} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">
              {template.description || name}
            </p>
            <p className="truncate text-xs text-text-tertiary">{name}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular-nums text-sm font-semibold text-text-primary">
            {formatNGN(template.amount)}
          </p>
          <p
            className={cn(
              'mt-0.5 text-xs font-medium',
              due.tone === 'red' ? 'text-red' : 'text-amber'
            )}
          >
            {due.text}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={cn(
            'pressable inline-flex min-h-11 flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold',
            'bg-orange text-orange-btn-text shadow-card',
            'transition-[background-color,transform] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
            'hover:bg-orange-hover active:translate-y-0 active:brightness-95',
            'disabled:pointer-events-none disabled:opacity-40',
            'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'
          )}
        >
          {confirmLoading ? 'Confirming…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={busy}
          className={cn(
            'inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-border-strong bg-transparent px-4 text-sm font-semibold text-text-primary',
            'hover:bg-bg-subtle transition-colors duration-150',
            'disabled:pointer-events-none disabled:opacity-40',
            'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'
          )}
        >
          {skipLoading ? 'Skipping…' : 'Skip'}
        </button>
      </div>
    </div>
  )
}

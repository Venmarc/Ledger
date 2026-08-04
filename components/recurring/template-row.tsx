'use client'

import { format, parseISO } from 'date-fns'
import { CategoryIcon } from '@/components/categories/category-icon'
import { ActiveSwitch } from '@/components/recurring/active-switch'
import { RECURRING_FREQUENCY_LABEL } from '@/lib/dates'
import { cn, formatNGN } from '@/lib/utils'
import type { RecurringTemplateWithCategory } from '@/lib/types/database'

function formatNextDue(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy')
}

type Props = {
  template: RecurringTemplateWithCategory
  onEdit: () => void
  onToggleActive: (active: boolean) => void
  toggleLoading?: boolean
}

export function TemplateRow({
  template,
  onEdit,
  onToggleActive,
  toggleLoading,
}: Props) {
  const name = template.categories?.name ?? 'Category'

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-bg-surface p-4 shadow-card',
        !template.is_active && 'opacity-50'
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        className="pressable flex min-w-0 flex-1 items-center gap-2.5 text-left cursor-pointer"
      >
        <CategoryIcon iconName={template.categories?.icon} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">
            {template.description || name}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-tertiary">
            Next due: {formatNextDue(template.next_date)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular-nums text-sm font-semibold text-text-primary">
            {formatNGN(template.amount)}
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {RECURRING_FREQUENCY_LABEL[template.frequency]}
          </p>
        </div>
      </button>

      <ActiveSwitch
        checked={template.is_active}
        onChange={onToggleActive}
        disabled={toggleLoading}
        label={`${template.is_active ? 'Deactivate' : 'Activate'} ${template.description || name}`}
      />
    </div>
  )
}

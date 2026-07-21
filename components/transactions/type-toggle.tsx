'use client'

import { cn } from '@/lib/utils'
import type { TransactionType } from '@/lib/types/database'
import { Field, FieldLabel } from '@/components/ui/field'

type TypeToggleProps = {
  value: TransactionType
  onChange: (value: TransactionType) => void
  disabled?: boolean
  className?: string
  label?: string
}

const OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
]

/** Segmented Income / Expense control — text labels, never icon-only. */
export function TypeToggle({
  value,
  onChange,
  disabled,
  className,
  label = 'Type',
}: TypeToggleProps) {
  return (
    <Field className={className}>
      <FieldLabel id="type-toggle-label">{label}</FieldLabel>
      <div
        role="group"
        aria-labelledby="type-toggle-label"
        className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-bg-subtle p-1"
      >
        {OPTIONS.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                'min-h-11 rounded-md px-3 text-sm font-medium transition-colors duration-150 cursor-pointer',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? opt.value === 'income'
                    ? 'bg-green-muted text-green shadow-sm'
                    : 'bg-red-muted text-red shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </Field>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { RECURRING_FREQUENCY_LABEL } from '@/lib/dates'
import { Field, FieldLabel } from '@/components/ui/field'
import type { RecurringTemplate } from '@/lib/types/database'

type Frequency = RecurringTemplate['frequency']

type Props = {
  value: Frequency
  onChange: (value: Frequency) => void
  disabled?: boolean
  className?: string
}

const OPTIONS: Frequency[] = ['daily', 'weekly', 'monthly', 'yearly']

/** Segmented Daily / Weekly / Monthly / Yearly control — mirrors TypeToggle. */
export function FrequencySelect({
  value,
  onChange,
  disabled,
  className,
}: Props) {
  return (
    <Field className={className}>
      <FieldLabel id="frequency-select-label" required>
        Frequency
      </FieldLabel>
      <div
        role="group"
        aria-labelledby="frequency-select-label"
        className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-bg-subtle p-1"
      >
        {OPTIONS.map((opt) => {
          const selected = value === opt
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(opt)}
              className={cn(
                'min-h-11 rounded-md px-1 text-xs font-medium transition-colors duration-150 cursor-pointer',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? 'bg-bg-surface text-text-primary shadow-sm border border-orange'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
              )}
            >
              {RECURRING_FREQUENCY_LABEL[opt]}
            </button>
          )
        })}
      </div>
    </Field>
  )
}

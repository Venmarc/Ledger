'use client'

import { cn } from '@/lib/utils'
import { PAYMENT_METHODS, type PaymentMethod } from '@/lib/types/database'
import { Field, FieldLabel } from '@/components/ui/field'

type PaymentMethodSelectProps = {
  value: PaymentMethod | null
  onChange: (value: PaymentMethod | null) => void
  disabled?: boolean
  className?: string
  label?: string
  /** Allow clearing selection */
  optional?: boolean
}

/** Horizontal payment chips — labeled, not icon-only. */
export function PaymentMethodSelect({
  value,
  onChange,
  disabled,
  className,
  label = 'Payment method',
  optional = true,
}: PaymentMethodSelectProps) {
  return (
    <Field className={className}>
      <FieldLabel id="payment-method-label">
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-text-tertiary">(optional)</span>
        ) : null}
      </FieldLabel>
      <div
        role="group"
        aria-labelledby="payment-method-label"
        className="flex flex-wrap gap-2"
      >
        {PAYMENT_METHODS.map((method) => {
          const selected = value === method
          return (
            <button
              key={method}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() =>
                onChange(selected && optional ? null : method)
              }
              className={cn(
                'min-h-10 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? 'border-azure bg-azure-muted text-azure'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
              )}
            >
              {method}
            </button>
          )
        })}
      </div>
    </Field>
  )
}

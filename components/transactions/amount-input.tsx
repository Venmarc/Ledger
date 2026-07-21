'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

type AmountInputProps = {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  autoFocus?: boolean
  disabled?: boolean
  className?: string
  name?: string
}

/**
 * Primary money field — tabular nums, ₦ prefix, decimal keypad on mobile.
 * Value is a plain decimal string for RHF (not formatted currency).
 */
export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  function AmountInput(
    {
      id = 'amount',
      label = 'Amount',
      value,
      onChange,
      onBlur,
      error,
      autoFocus,
      disabled,
      className,
      name,
    },
    ref
  ) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '')
      // Allow empty, digits, single decimal
      if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
        onChange(raw)
      }
    }

    return (
      <Field className={className}>
        <FieldLabel htmlFor={id} required>
          {label}
        </FieldLabel>
        <div
          className={cn(
            'flex h-12 min-h-[48px] w-full max-w-full items-center gap-2 rounded-lg border bg-bg-surface px-3.5 transition-[border-color,box-shadow] duration-150',
            error
              ? 'border-red'
              : 'border-border focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/35'
          )}
        >
          <span
            className="shrink-0 font-display text-lg font-semibold text-text-tertiary select-none"
            aria-hidden
          >
            ₦
          </span>
          <input
            ref={ref}
            id={id}
            name={name}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoFocus={autoFocus}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder="0.00"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              'w-full min-w-0 bg-transparent font-body text-lg font-semibold tabular-nums text-text-primary',
              /* Kill global focus outline on this field — ring is on the wrapper */
              'outline-none focus:outline-none focus-visible:outline-none',
              'placeholder:text-text-tertiary placeholder:font-medium',
              'disabled:opacity-50'
            )}
          />
        </div>
        <FieldError id={`${id}-error`}>{error}</FieldError>
      </Field>
    )
  }
)

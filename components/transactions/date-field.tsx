'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { todayInLagos } from '@/lib/dates'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

type DateFieldProps = {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  className?: string
  name?: string
  /** Max selectable date (defaults to Lagos today) */
  max?: string
}

/** Native date input styled to Ledger tokens; defaults should use todayInLagos(). */
export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  function DateField(
    {
      id = 'transaction_date',
      label = 'Date',
      value,
      onChange,
      onBlur,
      error,
      disabled,
      className,
      name,
      max = todayInLagos(),
    },
    ref
  ) {
    return (
      <Field className={className}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <input
          ref={ref}
          id={id}
          name={name}
          type="date"
          value={value}
          max={max}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-12 min-h-[48px] w-full rounded-lg border bg-bg-surface px-3.5 text-base text-text-primary transition-colors duration-150',
            'border-border focus:border-orange focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-orange',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red'
          )}
        />
        <FieldError>{error}</FieldError>
      </Field>
    )
  }
)

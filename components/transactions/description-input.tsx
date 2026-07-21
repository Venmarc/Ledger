'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Field, FieldLabel } from '@/components/ui/field'

type DescriptionInputProps = {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
  name?: string
  placeholder?: string
}

export const DescriptionInput = React.forwardRef<
  HTMLInputElement,
  DescriptionInputProps
>(function DescriptionInput(
  {
    id = 'description',
    label = 'Description',
    value,
    onChange,
    onBlur,
    disabled,
    className,
    name,
    placeholder = 'e.g. Danfo to Yaba',
  },
  ref
) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>
        {label}
        <span className="ml-1 font-normal text-text-tertiary">(optional)</span>
      </FieldLabel>
      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={500}
        className={cn(
          'h-12 min-h-[48px] w-full rounded-lg border border-border bg-bg-surface px-3.5 text-base text-text-primary transition-colors duration-150',
          'placeholder:text-text-tertiary',
          'focus:border-orange focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-orange',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />
    </Field>
  )
})

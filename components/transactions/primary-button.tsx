'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type PrimaryButtonProps = React.ComponentProps<'button'> & {
  loading?: boolean
}

/**
 * Orange CTA — uses text-orange-btn-text (WCAG on orange in light mode).
 * Smart-Form-Controls: pass disabled when pristine / invalid.
 */
export function PrimaryButton({
  className,
  loading,
  disabled,
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'pressable inline-flex min-h-12 w-full items-center justify-center rounded-lg px-5 text-sm font-semibold',
        'bg-orange text-orange-btn-text shadow-card',
        'transition-[background-color,transform,box-shadow] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
        'hover:bg-orange-hover hover:-translate-y-px hover:shadow-elevated active:translate-y-0 active:brightness-95',
        'disabled:pointer-events-none disabled:opacity-40 disabled:hover:translate-y-0',
        'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
        className
      )}
      {...props}
    >
      {loading ? 'Saving…' : children}
    </button>
  )
}

export function SecondaryButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'pressable inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-border-strong bg-transparent px-5 text-sm font-semibold text-text-primary',
        'transition-[background-color,transform] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
        'hover:bg-bg-subtle',
        'disabled:pointer-events-none disabled:opacity-40',
        'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
        className
      )}
      {...props}
    />
  )
}

export function DestructiveButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-red bg-red-muted px-5 text-sm font-semibold text-red transition-colors duration-150',
        'hover:bg-red hover:text-white',
        'disabled:pointer-events-none disabled:opacity-40',
        'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red',
        className
      )}
      {...props}
    />
  )
}

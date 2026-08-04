'use client'

import { cn } from '@/lib/utils'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label: string
  className?: string
}

/** Minimal track/thumb toggle — no Switch primitive installed in the project yet. */
export function ActiveSwitch({
  checked,
  onChange,
  disabled,
  label,
  className,
}: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!checked)
      }}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-150 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
        checked ? 'border-orange bg-orange' : 'border-border bg-bg-subtle',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-150',
          checked ? 'translate-x-[22px]' : 'translate-x-1'
        )}
      />
    </button>
  )
}

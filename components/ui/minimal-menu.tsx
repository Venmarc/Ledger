'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'

export type MenuOption<T extends string = string> = {
  value: T
  label: string
  hint?: string
  /** Optional leading node (color dot, etc.) */
  leading?: React.ReactNode
}

type MinimalMenuProps<T extends string> = {
  value: T
  options: MenuOption<T>[]
  onChange: (value: T) => void
  /** Trigger label when nothing special — defaults to selected option label */
  placeholder?: string
  active?: boolean
  ariaLabel: string
  className?: string
  /** Multi-select mode: value is comma-joined or managed externally */
  multi?: boolean
  selectedValues?: string[]
  onToggle?: (value: string) => void
  emptyLabel?: string
}

/**
 * Compact custom dropdown (no native <select>).
 * Portals menu so sticky/overflow parents never clip it.
 */
export function MinimalMenu<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  active,
  ariaLabel,
  className,
  multi,
  selectedValues,
  onToggle,
  emptyLabel = 'No options',
}: MinimalMenuProps<T>) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 180 })

  const selected = options.find((o) => o.value === value)
  const triggerLabel = multi
    ? selectedValues && selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : placeholder ?? 'Select'
    : selected?.label ?? placeholder ?? 'Select'

  const [openUp, setOpenUp] = React.useState(false)

  const updatePos = React.useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.max(r.width, 200)
    let left = r.left
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8)
    }
    const spaceBelow = window.innerHeight - r.bottom
    const up = spaceBelow < 260 && r.top > spaceBelow
    setOpenUp(up)
    setPos({
      top: up ? r.top - 4 : r.bottom + 4,
      left,
      width,
    })
  }, [])

  React.useEffect(() => {
    if (!open) return
    updatePos()
    const onScroll = () => updatePos()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        menuRef.current?.contains(t) ||
        triggerRef.current?.contains(t)
      ) {
        return
      }
      setOpen(false)
    }
    window.addEventListener('resize', onScroll)
    window.addEventListener('scroll', onScroll, true)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('scroll', onScroll, true)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open, updatePos])

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={ariaLabel}
          className="fixed z-[120] max-h-64 overflow-y-auto rounded-xl border border-border bg-bg-elevated p-1 shadow-xl ledger-scroll"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            transform: openUp ? 'translateY(-100%)' : undefined,
          }}
        >
          {options.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-text-tertiary">{emptyLabel}</p>
          ) : (
            options.map((opt) => {
              const isOn = multi
                ? selectedValues?.includes(opt.value)
                : opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={Boolean(isOn)}
                  onClick={() => {
                    if (multi && onToggle) {
                      onToggle(opt.value)
                      return
                    }
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full min-h-10 items-center gap-2 rounded-lg px-2.5 text-left text-sm cursor-pointer transition-colors',
                    isOn
                      ? 'bg-orange-muted text-text-primary'
                      : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                  )}
                >
                  {opt.leading}
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {opt.label}
                  </span>
                  {opt.hint ? (
                    <span className="shrink-0 text-[10px] uppercase text-text-tertiary">
                      {opt.hint}
                    </span>
                  ) : null}
                  {isOn ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-orange" aria-hidden />
                  ) : null}
                </button>
              )
            })
          )}
        </div>,
        document.body
      )
    : null

  return (
    <div className={cn('relative shrink-0', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex min-h-10 items-center gap-1.5 rounded-full border bg-bg-surface pl-3 pr-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap',
          active || open
            ? 'border-amber bg-amber-muted text-amber'
            : 'border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
        )}
      >
        <span className="max-w-[9rem] truncate">{triggerLabel}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 opacity-70 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {menu}
    </div>
  )
}

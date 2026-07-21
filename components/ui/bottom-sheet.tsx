'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type BottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  dismissible?: boolean
}

const SheetCtx = React.createContext<{
  onOpenChange: (open: boolean) => void
  dismissible: boolean
} | null>(null)

/**
 * Mobile: full-width bottom sheet.
 * Desktop (md+): centered card with side gutters + blurred backdrop.
 */
export function BottomSheet({
  open,
  onOpenChange,
  children,
  dismissible = true,
}: BottomSheetProps) {
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !dismissible) return
      // Nested AlertDialog (z-130) owns Escape while open — do not close the sheet under it
      if (document.querySelector('[data-slot="alert-dialog-overlay"]')) return
      onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, dismissible, onOpenChange])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <SheetCtx.Provider value={{ onOpenChange, dismissible }}>
      <div className="fixed inset-0 z-[100]" data-ledger-sheet-root="">
        <button
          type="button"
          aria-label="Close sheet"
          className="absolute inset-0 z-0 border-0 bg-black/60 p-0 backdrop-blur-[4px] cursor-default"
          onClick={() => {
            if (dismissible) onOpenChange(false)
          }}
        />

        {/* Mobile: docked bottom full-width. Desktop: centered dialog card. */}
        <div
          role="dialog"
          aria-modal="true"
          data-slot="drawer-content"
          className={cn(
            'absolute z-10 w-full overflow-hidden bg-bg-elevated text-text-primary shadow-2xl outline-none',
            // Mobile bottom sheet — layered depth + blur entrance (Rules 5–6)
            'inset-x-0 bottom-0 max-h-[92vh] rounded-t-[14px] border-t border-border shadow-elevated',
            'animate-in slide-in-from-bottom-4 fade-in duration-300',
            // Desktop centered card — not edge-to-edge
            'md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:max-w-md',
            'md:-translate-x-1/2 md:-translate-y-1/2 md:max-h-[min(85vh,640px)]',
            'md:rounded-xl md:border md:border-border',
            'md:slide-in-from-bottom-0 md:zoom-in-95'
          )}
        >
          {children}
        </div>
      </div>
    </SheetCtx.Provider>,
    document.body
  )
}

export function BottomSheetContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<'div'> & { showClose?: boolean }) {
  const ctx = React.useContext(SheetCtx)

  return (
    <div className={cn('relative w-full', className)} {...props}>
      {/* Mobile drag handle only */}
      <div
        className="mx-auto mt-3 mb-1 h-1 w-8 shrink-0 rounded-full bg-border-strong md:hidden"
        aria-hidden
      />
      {showClose && (
        <button
          type="button"
          onClick={() => ctx?.onOpenChange(false)}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-bg-subtle hover:text-text-primary cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <div className="max-h-[calc(92vh-1.5rem)] overflow-y-auto overscroll-contain ledger-scroll md:max-h-[min(85vh,640px)]">
        {children}
      </div>
    </div>
  )
}

export function BottomSheetHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1 px-4 pt-2 pb-3 text-left md:pt-4', className)}
      {...props}
    />
  )
}

export function BottomSheetTitle({
  className,
  ...props
}: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'font-display text-lg font-semibold text-text-primary',
        className
      )}
      {...props}
    />
  )
}

export function BottomSheetDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm text-text-secondary', className)} {...props} />
  )
}

export function BottomSheetBody({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-4 px-4 pb-2', className)} {...props} />
  )
}

export function BottomSheetFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-auto flex shrink-0 flex-col gap-2 border-t border-border bg-bg-elevated px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]',
        className
      )}
      {...props}
    />
  )
}

export function BottomSheetClose({
  className,
  children,
  ...props
}: React.ComponentProps<'button'>) {
  const ctx = React.useContext(SheetCtx)
  return (
    <button
      type="button"
      className={className}
      onClick={() => ctx?.onOpenChange(false)}
      {...props}
    >
      {children}
    </button>
  )
}

'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { useUIStore } from '@/lib/store'
import type { TransactionWithCategory } from '@/lib/types/database'
import { cn } from '@/lib/utils'

type Props = {
  transaction: TransactionWithCategory
  anchor: { x: number; y: number }
  onClose: () => void
  /** Parent owns ConfirmDialog so portaled confirm is not unmounted by menu outside-click. */
  onDeleteRequest: (tx: TransactionWithCategory) => void
}

/** Desktop ⋮ menu: Edit + Delete. Confirm lives on the list parent (Browser-Native-Dialog-Trap). */
export function RowActionsMenu({
  transaction,
  anchor,
  onClose,
  onDeleteRequest,
}: Props) {
  const setEditingId = useUIStore((s) => s.setEditingTransactionId)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [onClose])

  if (typeof document === 'undefined') return null

  const menu = (
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        'fixed z-[60] min-w-[160px] rounded-xl border border-border bg-bg-elevated py-1 shadow-lg'
      )}
      style={{
        top: Math.min(anchor.y, window.innerHeight - 120),
        left: Math.min(anchor.x, window.innerWidth - 180),
      }}
    >
      <button
        type="button"
        role="menuitem"
        className="flex w-full min-h-11 items-center px-3 text-left text-sm font-medium text-text-primary hover:bg-bg-subtle cursor-pointer"
        onClick={() => {
          setEditingId(transaction.id)
          onClose()
        }}
      >
        Edit
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full min-h-11 items-center px-3 text-left text-sm font-medium text-red hover:bg-red-muted cursor-pointer"
        onClick={() => {
          onDeleteRequest(transaction)
          onClose()
        }}
      >
        Delete
      </button>
    </div>
  )

  return createPortal(menu, document.body)
}

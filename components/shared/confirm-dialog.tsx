'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** destructive = red confirm (delete/archive) */
  variant?: 'destructive' | 'default'
  onConfirm: () => void
  loading?: boolean
}

/**
 * Custom confirm dialog — never window.confirm (Browser-Native-Dialog-Trap).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border bg-bg-elevated text-text-primary sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-text-primary">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-text-secondary">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="min-h-11 border-border-strong bg-transparent text-text-primary hover:bg-bg-subtle cursor-pointer"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className={cn(
              'min-h-11 cursor-pointer',
              variant === 'destructive'
                ? 'border border-red bg-red-muted text-red hover:bg-red hover:text-white'
                : 'bg-orange text-orange-btn-text hover:bg-orange-hover'
            )}
          >
            {loading ? 'Working…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

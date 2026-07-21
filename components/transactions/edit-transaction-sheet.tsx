'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  DestructiveButton,
  PrimaryButton,
} from '@/components/transactions'
import { TransactionFormFields } from '@/components/transactions/transaction-form-fields'
import { useDeleteWithUndo } from '@/lib/hooks/use-delete-with-undo'
import {
  useTransaction,
  useUpdateTransaction,
} from '@/lib/hooks/use-transactions'
import { useUIStore } from '@/lib/store'
import {
  formFromTransaction,
  isFormDirty,
  type TransactionFormValues,
} from '@/lib/transaction-form'
import { formatNGN } from '@/lib/utils'
import type { TransactionWithCategory } from '@/lib/types/database'
import { Loader2 } from 'lucide-react'

function EditFormInner({
  tx,
  onClose,
}: {
  tx: TransactionWithCategory
  onClose: () => void
}) {
  const updateMutation = useUpdateTransaction()
  const { deleteWithUndo, isDeleting } = useDeleteWithUndo()

  const [baseline, setBaseline] = React.useState(() => formFromTransaction(tx))
  const [form, setForm] = React.useState(() => formFromTransaction(tx))
  const [showNotes, setShowNotes] = React.useState(() => Boolean(tx.notes))
  const [amountError, setAmountError] = React.useState<string>()
  const [categoryError, setCategoryError] = React.useState<string>()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const dirty = isFormDirty(form, baseline)
  const amountNum = parseFloat(form.amount.replace(/,/g, ''))
  const amountValid = Number.isFinite(amountNum) && amountNum > 0
  const categoryValid = Boolean(form.category_id)
  const canSave =
    dirty &&
    amountValid &&
    categoryValid &&
    !updateMutation.isPending &&
    !isDeleting

  const patch = (p: Partial<TransactionFormValues>) => {
    setForm((prev) => ({ ...prev, ...p }))
  }

  const validate = () => {
    let ok = true
    if (!amountValid) {
      setAmountError('Enter an amount greater than 0')
      ok = false
    } else setAmountError(undefined)
    if (!categoryValid) {
      setCategoryError('Pick a category')
      ok = false
    } else setCategoryError(undefined)
    return ok
  }

  const handleSave = async () => {
    if (!form.category_id || !validate()) return
    try {
      const updated = await updateMutation.mutateAsync({
        id: tx.id,
        amount: amountNum,
        type: form.type,
        category_id: form.category_id,
        transaction_date: form.transaction_date,
        description: form.description || null,
        notes: form.notes || null,
        payment_method: form.payment_method,
      })
      const next = formFromTransaction(updated)
      setForm(next)
      setBaseline(next)
      toast.success('Changes saved')
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not save changes'
      )
    }
  }

  const handleDelete = async () => {
    const ok = await deleteWithUndo(tx)
    setConfirmDelete(false)
    if (ok) onClose()
  }

  const catName = tx.categories?.name ?? 'this'

  return (
    <>
      <BottomSheetHeader className="pr-12">
        <BottomSheetTitle>Edit transaction</BottomSheetTitle>
        <BottomSheetDescription>
          {formatNGN(tx.amount)} · {catName}
        </BottomSheetDescription>
      </BottomSheetHeader>

      <BottomSheetBody>
        <TransactionFormFields
          values={form}
          onChange={patch}
          amountError={amountError}
          categoryError={categoryError}
          disabled={updateMutation.isPending || isDeleting}
          showNotes={showNotes || Boolean(form.notes)}
          onToggleNotes={() => setShowNotes((v) => !v)}
        />
      </BottomSheetBody>

      <BottomSheetFooter className="flex-col gap-3">
        <PrimaryButton
          onClick={() => void handleSave()}
          disabled={!canSave}
          loading={updateMutation.isPending}
        >
          Save Changes
        </PrimaryButton>
        <div className="h-px w-full bg-border" aria-hidden />
        <DestructiveButton
          onClick={() => setConfirmDelete(true)}
          disabled={updateMutation.isPending || isDeleting}
        >
          Delete Transaction
        </DestructiveButton>
      </BottomSheetFooter>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          // Block dismiss while delete mutation is in flight
          if (!open && isDeleting) return
          setConfirmDelete(open)
        }}
        title="Delete transaction?"
        description={`Delete this ${formatNGN(tx.amount)} ${catName} transaction? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}

function EditFormBody({
  transactionId,
  onClose,
}: {
  transactionId: string
  onClose: () => void
}) {
  const { data: tx, isLoading, isError, error, refetch } =
    useTransaction(transactionId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-text-tertiary">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
      </div>
    )
  }

  if (isError || !tx) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-red">
          {error instanceof Error
            ? error.message
            : 'Could not load transaction.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 min-h-11 text-sm font-semibold text-azure cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  return <EditFormInner key={tx.id} tx={tx} onClose={onClose} />
}

/**
 * Edit bottom sheet driven by UI store editingTransactionId.
 * Isolated from Quick Add draft (State-Isolation skill).
 */
export function EditTransactionSheet() {
  const editingId = useUIStore((s) => s.editingTransactionId)
  const setEditingId = useUIStore((s) => s.setEditingTransactionId)

  const open = Boolean(editingId)

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setEditingId(null)
      }}
    >
      <BottomSheetContent showClose>
        {editingId ? (
          <EditFormBody
            key={editingId}
            transactionId={editingId}
            onClose={() => setEditingId(null)}
          />
        ) : null}
      </BottomSheetContent>
    </BottomSheet>
  )
}

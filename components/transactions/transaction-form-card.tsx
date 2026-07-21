'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from '@/components/transactions'
import { TransactionFormFields } from '@/components/transactions/transaction-form-fields'
import { useDeleteWithUndo } from '@/lib/hooks/use-delete-with-undo'
import {
  useTransaction,
  useUpdateTransaction,
} from '@/lib/hooks/use-transactions'
import {
  formFromTransaction,
  isFormDirty,
  type TransactionFormValues,
} from '@/lib/transaction-form'
import { formatNGN } from '@/lib/utils'
import type { TransactionWithCategory } from '@/lib/types/database'
import { Loader2 } from 'lucide-react'

function TransactionFormCardInner({
  tx,
}: {
  tx: TransactionWithCategory
}) {
  const router = useRouter()
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

  const catName = tx.categories?.name ?? 'this'

  const handleSave = async () => {
    if (!form.category_id) {
      setCategoryError('Pick a category')
      return
    }
    if (!amountValid) {
      setAmountError('Enter an amount greater than 0')
      return
    }
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
      router.push('/transactions')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not save changes'
      )
    }
  }

  const handleDelete = async () => {
    setConfirmDelete(false)
    const ok = await deleteWithUndo(tx)
    if (ok) router.push('/transactions')
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-border bg-bg-surface p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-text-primary">
          Edit transaction
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {formatNGN(tx.amount)} · {catName}
        </p>
      </div>

      <TransactionFormFields
        values={form}
        onChange={patch}
        amountError={amountError}
        categoryError={categoryError}
        disabled={updateMutation.isPending || isDeleting}
        showNotes={showNotes || Boolean(form.notes)}
        onToggleNotes={() => setShowNotes((v) => !v)}
      />

      <div className="flex flex-col gap-3 pt-2">
        <PrimaryButton
          onClick={() => void handleSave()}
          disabled={!canSave}
          loading={updateMutation.isPending}
        >
          Save Changes
        </PrimaryButton>
        <SecondaryButton
          type="button"
          onClick={() => router.push('/transactions')}
        >
          Cancel
        </SecondaryButton>
        <div className="h-px w-full bg-border" />
        <DestructiveButton
          onClick={() => setConfirmDelete(true)}
          disabled={updateMutation.isPending || isDeleting}
        >
          Delete Transaction
        </DestructiveButton>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete transaction?"
        description={`Delete this ${formatNGN(tx.amount)} ${catName} transaction? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}

/**
 * Full-page / centered card edit for `/transactions/[id]` deep link.
 */
export function TransactionFormCard({ id }: { id: string }) {
  const { data: tx, isLoading, isError, error, refetch } = useTransaction(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-text-tertiary">
        <Loader2 className="h-7 w-7 animate-spin" aria-label="Loading" />
      </div>
    )
  }

  if (isError || !tx) {
    return (
      <div className="rounded-xl border border-red/40 bg-red-muted px-4 py-10 text-center">
        <p className="text-sm text-red">
          {error instanceof Error ? error.message : 'Transaction not found.'}
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

  return <TransactionFormCardInner key={tx.id} tx={tx} />
}

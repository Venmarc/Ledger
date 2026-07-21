'use client'

import { toast } from 'sonner'
import {
  useDeleteTransaction,
  useRestoreTransaction,
} from '@/lib/hooks/use-transactions'
import { snapshotToRestoreInput } from '@/lib/transaction-form'
import { formatNGN } from '@/lib/utils'
import type { TransactionWithCategory } from '@/lib/types/database'

/** Optimistic delete + 5s undo toast (PAGE_SPECS delete flow). */
export function useDeleteWithUndo() {
  const deleteMutation = useDeleteTransaction()
  const restoreMutation = useRestoreTransaction()

  const deleteWithUndo = async (tx: TransactionWithCategory) => {
    const categoryName = tx.categories?.name ?? 'transaction'
    try {
      await deleteMutation.mutateAsync({ id: tx.id, snapshot: tx })
      toast.message(`Deleted ${formatNGN(tx.amount)} · ${categoryName}`, {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            void restoreMutation
              .mutateAsync(snapshotToRestoreInput(tx))
              .then(() => {
                toast.success('Transaction restored')
              })
              .catch((err) => {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : 'Could not restore transaction'
                )
              })
          },
        },
      })
      return true
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not delete transaction'
      )
      return false
    }
  }

  return {
    deleteWithUndo,
    isDeleting: deleteMutation.isPending,
    isRestoring: restoreMutation.isPending,
  }
}

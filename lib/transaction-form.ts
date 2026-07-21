import type {
  PaymentMethod,
  TransactionType,
  TransactionWithCategory,
} from '@/lib/types/database'

/** Local edit form — never mixed with Quick Add draft store. */
export type TransactionFormValues = {
  amount: string
  type: TransactionType
  category_id: string | null
  payment_method: PaymentMethod | null
  transaction_date: string
  description: string
  notes: string
}

export function formFromTransaction(
  tx: TransactionWithCategory
): TransactionFormValues {
  return {
    amount: String(tx.amount),
    type: tx.type,
    category_id: tx.category_id,
    payment_method: tx.payment_method,
    transaction_date: tx.transaction_date,
    description: tx.description ?? '',
    notes: tx.notes ?? '',
  }
}

export function isFormDirty(
  current: TransactionFormValues,
  baseline: TransactionFormValues
): boolean {
  return (
    current.amount !== baseline.amount ||
    current.type !== baseline.type ||
    current.category_id !== baseline.category_id ||
    current.payment_method !== baseline.payment_method ||
    current.transaction_date !== baseline.transaction_date ||
    current.description !== baseline.description ||
    current.notes !== baseline.notes
  )
}

export function snapshotToRestoreInput(tx: TransactionWithCategory) {
  return {
    id: tx.id,
    amount: parseFloat(String(tx.amount)),
    type: tx.type,
    category_id: tx.category_id,
    transaction_date: tx.transaction_date,
    description: tx.description,
    notes: tx.notes,
    payment_method: tx.payment_method,
    tags: tx.tags,
    recurring_id: tx.recurring_id,
  }
}

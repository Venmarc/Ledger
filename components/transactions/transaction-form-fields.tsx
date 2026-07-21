'use client'

import {
  AmountInput,
  CategoryPills,
  CategoryPillsSkeleton,
  DateField,
  DescriptionInput,
  PaymentMethodSelect,
  TypeToggle,
} from '@/components/transactions'
import { useCategoriesByType } from '@/lib/hooks/use-categories'
import type { TransactionFormValues } from '@/lib/transaction-form'
import type { PaymentMethod, TransactionType } from '@/lib/types/database'

type Props = {
  values: TransactionFormValues
  onChange: (patch: Partial<TransactionFormValues>) => void
  amountError?: string
  categoryError?: string
  disabled?: boolean
  showNotes?: boolean
  onToggleNotes?: () => void
}

/** Shared field stack for Quick Add layout parity (edit uses this without draft). */
export function TransactionFormFields({
  values,
  onChange,
  amountError,
  categoryError,
  disabled,
  showNotes,
  onToggleNotes,
}: Props) {
  const { categories, isLoading } = useCategoriesByType(values.type)

  const handleTypeChange = (type: TransactionType) => {
    onChange({
      type,
      category_id: type === values.type ? values.category_id : null,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <AmountInput
        value={values.amount}
        onChange={(amount) => onChange({ amount })}
        error={amountError}
        disabled={disabled}
      />

      <TypeToggle
        value={values.type}
        onChange={handleTypeChange}
        disabled={disabled}
      />

      {isLoading ? (
        <CategoryPillsSkeleton />
      ) : (
        <CategoryPills
          categories={categories}
          value={values.category_id}
          error={categoryError}
          disabled={disabled}
          onChange={(category_id) => onChange({ category_id })}
        />
      )}

      <PaymentMethodSelect
        value={values.payment_method}
        onChange={(payment_method: PaymentMethod | null) =>
          onChange({ payment_method })
        }
        disabled={disabled}
      />

      <DateField
        value={values.transaction_date}
        onChange={(transaction_date) => onChange({ transaction_date })}
        disabled={disabled}
      />

      <DescriptionInput
        value={values.description}
        onChange={(description) => onChange({ description })}
        disabled={disabled}
      />

      {onToggleNotes ? (
        <button
          type="button"
          onClick={onToggleNotes}
          className="self-start text-sm font-medium text-azure hover:underline cursor-pointer min-h-10"
        >
          {showNotes ? 'Hide notes' : 'Add notes'}
        </button>
      ) : null}

      {showNotes ? (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tx-notes"
            className="text-sm font-medium text-text-secondary"
          >
            Notes{' '}
            <span className="font-normal text-text-tertiary">(optional)</span>
          </label>
          <textarea
            id="tx-notes"
            value={values.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            disabled={disabled}
            rows={3}
            maxLength={2000}
            placeholder="Extra context…"
            className="w-full rounded-lg border border-border bg-bg-surface px-3.5 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-orange focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-orange resize-y min-h-[88px] disabled:opacity-50"
          />
        </div>
      ) : null}
    </div>
  )
}

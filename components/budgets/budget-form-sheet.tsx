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
import { Field, FieldLabel } from '@/components/ui/field'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { AmountInput } from '@/components/transactions/amount-input'
import { CategoryPills } from '@/components/transactions/category-pills'
import {
  DestructiveButton,
  PrimaryButton,
} from '@/components/transactions/primary-button'
import {
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from '@/lib/hooks/use-budgets'
import { CategoryIcon } from '@/components/categories/category-icon'
import type { BudgetWithActual, Category } from '@/lib/types/database'

export type BudgetFormMode =
  | { kind: 'create'; monthKey: string }
  | { kind: 'edit'; budget: BudgetWithActual }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: BudgetFormMode | null
  /** Expense categories not yet budgeted this month (create only). */
  unbudgetedCategories: Category[]
}

function amountToInputString(n: number): string {
  if (!Number.isFinite(n)) return ''
  // Keep two decimals when needed; drop trailing .00 for cleaner edit UX
  const rounded = Math.round(n * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}

function parseAmountInput(raw: string): number | null {
  if (!raw.trim()) return null
  const n = parseFloat(raw.replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 100) / 100
}

function BudgetFormInner({
  mode,
  unbudgetedCategories,
  onClose,
}: {
  mode: BudgetFormMode
  unbudgetedCategories: Category[]
  onClose: () => void
}) {
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const deleteMutation = useDeleteBudget()

  const isEdit = mode.kind === 'edit'
  const editing = mode.kind === 'edit' ? mode.budget : null

  const [categoryId, setCategoryId] = React.useState(() =>
    isEdit && editing ? editing.category_id : ''
  )
  const [amount, setAmount] = React.useState(() =>
    isEdit && editing ? amountToInputString(editing.limit) : ''
  )
  const [categoryError, setCategoryError] = React.useState<string>()
  const [amountError, setAmountError] = React.useState<string>()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const pending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const parsedAmount = parseAmountInput(amount)
  const amountUnchanged =
    isEdit &&
    editing != null &&
    parsedAmount != null &&
    Math.abs(parsedAmount - editing.limit) < 0.001

  const canSaveCreate =
    !isEdit && Boolean(categoryId) && parsedAmount != null && !pending
  const canSaveEdit =
    isEdit && parsedAmount != null && !amountUnchanged && !pending
  const canSave = isEdit ? canSaveEdit : canSaveCreate

  const handleSave = async () => {
    setCategoryError(undefined)
    setAmountError(undefined)

    if (!isEdit && !categoryId) {
      setCategoryError('Category is required')
      return
    }
    if (parsedAmount == null) {
      setAmountError('Amount must be greater than 0')
      return
    }

    try {
      if (isEdit && editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          amount: parsedAmount,
        })
        toast.success('Budget updated')
      } else if (mode.kind === 'create') {
        await createMutation.mutateAsync({
          category_id: categoryId,
          month: mode.monthKey,
          amount: parsedAmount,
          period: 'monthly',
        })
        toast.success('Budget created')
      }
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not save budget'
      )
    }
  }

  const handleDelete = async () => {
    if (!editing) return
    try {
      await deleteMutation.mutateAsync(editing.id)
      toast.success('Budget deleted')
      setConfirmDelete(false)
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not delete budget'
      )
    }
  }

  const editName = editing?.categories?.name ?? 'Category'

  return (
    <>
      <BottomSheetHeader className="pr-12">
        <BottomSheetTitle>
          {isEdit ? 'Edit budget' : 'Add budget'}
        </BottomSheetTitle>
        <BottomSheetDescription>
          {isEdit
            ? 'Update the monthly limit. Deleting removes the limit only.'
            : 'Set a monthly spending limit for one expense category.'}
        </BottomSheetDescription>
      </BottomSheetHeader>

      <BottomSheetBody>
        {isEdit ? (
          <Field>
            <FieldLabel>Category</FieldLabel>
            <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-bg-subtle px-3.5">
              <CategoryIcon iconName={editing?.categories?.icon} size="sm" />
              <span className="truncate text-sm font-medium text-text-primary">
                {editName}
              </span>
            </div>
          </Field>
        ) : unbudgetedCategories.length === 0 ? (
          <Field>
            <FieldLabel required>Category</FieldLabel>
            <p className="text-sm text-text-secondary">
              All expense categories already have budgets this month.
            </p>
          </Field>
        ) : (
          <CategoryPills
            categories={unbudgetedCategories}
            value={categoryId || null}
            onChange={(id) => {
              setCategoryId(id)
              setCategoryError(undefined)
            }}
            error={categoryError}
            disabled={pending}
            label="Category"
          />
        )}

        <AmountInput
          id="budget-amount"
          label="Monthly limit"
          value={amount}
          onChange={(v) => {
            setAmount(v)
            setAmountError(undefined)
          }}
          error={amountError}
          disabled={pending}
          autoFocus={isEdit}
        />
      </BottomSheetBody>

      <BottomSheetFooter>
        <PrimaryButton
          type="button"
          onClick={() => void handleSave()}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={!canSave}
        >
          {isEdit ? 'Update' : 'Save'}
        </PrimaryButton>
        {isEdit ? (
          <DestructiveButton
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={pending}
          >
            Delete Budget
          </DestructiveButton>
        ) : null}
      </BottomSheetFooter>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete budget?"
        description="This removes the spending limit for this category. Your transactions stay."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}

export function BudgetFormSheet({
  open,
  onOpenChange,
  mode,
  unbudgetedCategories,
}: Props) {
  const formKey =
    mode?.kind === 'edit'
      ? `edit-${mode.budget.id}`
      : mode?.kind === 'create'
        ? `create-${mode.monthKey}`
        : 'closed'

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        {open && mode ? (
          <BudgetFormInner
            key={formKey}
            mode={mode}
            unbudgetedCategories={unbudgetedCategories}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </BottomSheetContent>
    </BottomSheet>
  )
}

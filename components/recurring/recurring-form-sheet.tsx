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
  AmountInput,
  CategoryPills,
  CategoryPillsSkeleton,
  TypeToggle,
  DateField,
  DescriptionInput,
  DestructiveButton,
  PrimaryButton,
} from '@/components/transactions'
import { FrequencySelect } from '@/components/recurring/frequency-select'
import { useCategoriesByType } from '@/lib/hooks/use-categories'
import {
  useCreateRecurringTemplate,
  useDeleteRecurringTemplate,
  useUpdateRecurringTemplate,
} from '@/lib/hooks/use-recurring'
import { todayInLagos } from '@/lib/dates'
import type {
  RecurringTemplateWithCategory,
  TransactionType,
} from '@/lib/types/database'

export type RecurringFormMode =
  | { kind: 'create' }
  | { kind: 'edit'; template: RecurringTemplateWithCategory }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: RecurringFormMode | null
}

function amountToInputString(n: string | number): string {
  const num = typeof n === 'number' ? n : parseFloat(n)
  if (!Number.isFinite(num)) return ''
  const rounded = Math.round(num * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}

function parseAmountInput(raw: string): number | null {
  if (!raw.trim()) return null
  const n = parseFloat(raw.replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 100) / 100
}

function RecurringFormInner({
  mode,
  onClose,
}: {
  mode: RecurringFormMode
  onClose: () => void
}) {
  const createMutation = useCreateRecurringTemplate()
  const updateMutation = useUpdateRecurringTemplate()
  const deleteMutation = useDeleteRecurringTemplate()

  const isEdit = mode.kind === 'edit'
  const editing = mode.kind === 'edit' ? mode.template : null

  const [type, setType] = React.useState<TransactionType>(
    editing?.type ?? 'expense'
  )
  const [categoryId, setCategoryId] = React.useState<string | null>(
    editing?.category_id ?? null
  )
  const [description, setDescription] = React.useState(
    editing?.description ?? ''
  )
  const [amount, setAmount] = React.useState(() =>
    editing ? amountToInputString(editing.amount) : ''
  )
  const [frequency, setFrequency] = React.useState<
    RecurringTemplateWithCategory['frequency']
  >(editing?.frequency ?? 'monthly')
  const [nextDate, setNextDate] = React.useState(
    editing?.next_date ?? todayInLagos()
  )

  const [descriptionError, setDescriptionError] = React.useState<string>()
  const [categoryError, setCategoryError] = React.useState<string>()
  const [amountError, setAmountError] = React.useState<string>()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const { categories, isLoading: categoriesLoading } =
    useCategoriesByType(type)

  const pending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const parsedAmount = parseAmountInput(amount)
  const canSave =
    description.trim().length > 0 &&
    Boolean(categoryId) &&
    parsedAmount != null &&
    Boolean(nextDate) &&
    !pending

  const handleTypeChange = (next: TransactionType) => {
    setType(next)
    setCategoryId(null)
    setCategoryError(undefined)
  }

  const handleSave = async () => {
    setDescriptionError(undefined)
    setCategoryError(undefined)
    setAmountError(undefined)

    if (!description.trim()) {
      setDescriptionError('Description is required')
      return
    }
    if (!categoryId) {
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
          category_id: categoryId,
          type,
          description: description.trim(),
          amount: parsedAmount,
          frequency,
          next_date: nextDate,
        })
        toast.success('Recurring template updated')
      } else {
        await createMutation.mutateAsync({
          category_id: categoryId,
          type,
          description: description.trim(),
          amount: parsedAmount,
          frequency,
          next_date: nextDate,
        })
        toast.success('Recurring template created')
      }
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not save recurring template'
      )
    }
  }

  const handleDelete = async () => {
    if (!editing) return
    try {
      await deleteMutation.mutateAsync(editing.id)
      toast.success('Recurring template deleted')
      setConfirmDelete(false)
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not delete recurring template'
      )
    }
  }

  return (
    <>
      <BottomSheetHeader className="pr-12">
        <BottomSheetTitle>
          {isEdit ? 'Edit recurring template' : 'New recurring template'}
        </BottomSheetTitle>
        <BottomSheetDescription>
          {isEdit
            ? 'Changes affect future occurrences only.'
            : 'Add a predictable, repeating transaction.'}
        </BottomSheetDescription>
      </BottomSheetHeader>

      <BottomSheetBody>
        <DescriptionInput
          id="recurring-description"
          label="Description"
          value={description}
          onChange={(v) => {
            setDescription(v)
            setDescriptionError(undefined)
          }}
          disabled={pending}
          placeholder="e.g. Salary"
        />

        <TypeToggle value={type} onChange={handleTypeChange} disabled={pending} />

        {categoriesLoading ? (
          <CategoryPillsSkeleton />
        ) : (
          <CategoryPills
            categories={categories}
            value={categoryId}
            onChange={(id) => {
              setCategoryId(id)
              setCategoryError(undefined)
            }}
            error={categoryError}
            disabled={pending}
          />
        )}

        <AmountInput
          id="recurring-amount"
          value={amount}
          onChange={(v) => {
            setAmount(v)
            setAmountError(undefined)
          }}
          error={amountError}
          disabled={pending}
        />

        <FrequencySelect value={frequency} onChange={setFrequency} disabled={pending} />

        <DateField
          id="recurring-next-date"
          label={isEdit ? 'Next occurrence' : 'First occurrence'}
          value={nextDate}
          onChange={setNextDate}
          disabled={pending}
          max="2999-12-31"
        />
      </BottomSheetBody>

      {descriptionError ? (
        <p className="px-6 text-xs text-red">{descriptionError}</p>
      ) : null}

      <BottomSheetFooter>
        <PrimaryButton
          type="button"
          onClick={() => void handleSave()}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={!canSave}
        >
          {isEdit ? 'Save changes' : 'Create'}
        </PrimaryButton>
        {isEdit ? (
          <DestructiveButton
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={pending}
          >
            Delete Template
          </DestructiveButton>
        ) : null}
      </BottomSheetFooter>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete recurring template?"
        description="This stops future reminders. Transactions already created from this template are not affected."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}

export function RecurringFormSheet({ open, onOpenChange, mode }: Props) {
  const formKey =
    mode?.kind === 'edit'
      ? `edit-${mode.template.id}`
      : mode?.kind === 'create'
        ? 'create'
        : 'closed'

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        {open && mode ? (
          <RecurringFormInner key={formKey} mode={mode} onClose={() => onOpenChange(false)} />
        ) : null}
      </BottomSheetContent>
    </BottomSheet>
  )
}

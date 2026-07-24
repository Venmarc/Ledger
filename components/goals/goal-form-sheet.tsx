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
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { AmountInput } from '@/components/transactions/amount-input'
import { DateField } from '@/components/transactions/date-field'
import { PrimaryButton } from '@/components/transactions/primary-button'
import { useCreateGoal } from '@/lib/hooks/use-goals'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function parseAmountInput(raw: string): number | null {
  if (!raw.trim()) return null
  const n = parseFloat(raw.replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 100) / 100
}

function GoalFormInner({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateGoal()

  const [title, setTitle] = React.useState('')
  const [targetAmount, setTargetAmount] = React.useState('')
  const [targetDate, setTargetDate] = React.useState('')
  const [description, setDescription] = React.useState('')

  const [titleError, setTitleError] = React.useState<string>()
  const [amountError, setAmountError] = React.useState<string>()

  const parsedAmount = parseAmountInput(targetAmount)
  const canSave = Boolean(title.trim()) && parsedAmount != null && !createMutation.isPending

  const handleSave = async () => {
    setTitleError(undefined)
    setAmountError(undefined)

    if (!title.trim()) {
      setTitleError('Title is required')
      return
    }
    if (parsedAmount == null) {
      setAmountError('Target amount must be greater than 0')
      return
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        target_amount: parsedAmount,
        target_date: targetDate || null,
        description: description.trim() || null,
        current_amount: 0,
      })
      toast.success('Savings goal created')
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not create savings goal'
      )
    }
  }

  return (
    <>
      <BottomSheetHeader className="pr-12">
        <BottomSheetTitle>Create savings goal</BottomSheetTitle>
        <BottomSheetDescription>
          Set a target amount and date to track your savings progress.
        </BottomSheetDescription>
      </BottomSheetHeader>

      <BottomSheetBody className="space-y-4">
        <Field>
          <FieldLabel htmlFor="goal-title" required>
            Goal name
          </FieldLabel>
          <input
            id="goal-title"
            type="text"
            placeholder="e.g. New Laptop, Emergency Fund"
            maxLength={80}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleError(undefined)
            }}
            disabled={createMutation.isPending}
            className="h-12 min-h-[48px] w-full rounded-lg border border-border bg-bg-surface px-3.5 text-base text-text-primary transition-[border-color,box-shadow] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)] focus:border-orange focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-orange disabled:opacity-50"
          />
          <FieldError>{titleError}</FieldError>
        </Field>

        <AmountInput
          id="goal-target-amount"
          label="Target amount"
          value={targetAmount}
          onChange={(v) => {
            setTargetAmount(v)
            setAmountError(undefined)
          }}
          error={amountError}
          disabled={createMutation.isPending}
        />

        <DateField
          id="goal-target-date"
          label="Target date (optional)"
          value={targetDate}
          max=""
          onChange={(v) => setTargetDate(v)}
          disabled={createMutation.isPending}
        />

        <Field>
          <FieldLabel htmlFor="goal-description">Description (optional)</FieldLabel>
          <textarea
            id="goal-description"
            rows={3}
            maxLength={500}
            placeholder="What is this goal for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={createMutation.isPending}
            className="w-full rounded-lg border border-border bg-bg-surface p-3 text-base text-text-primary transition-[border-color,box-shadow] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)] focus:border-orange focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-orange disabled:opacity-50"
          />
        </Field>
      </BottomSheetBody>

      <BottomSheetFooter>
        <PrimaryButton
          type="button"
          onClick={() => void handleSave()}
          loading={createMutation.isPending}
          disabled={!canSave}
        >
          Create Goal
        </PrimaryButton>
      </BottomSheetFooter>
    </>
  )
}

export function GoalFormSheet({ open, onOpenChange }: Props) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        {open ? (
          <GoalFormInner
            key={open ? 'open' : 'closed'}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </BottomSheetContent>
    </BottomSheet>
  )
}

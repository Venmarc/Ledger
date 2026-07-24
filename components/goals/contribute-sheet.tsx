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
import { AmountInput } from '@/components/transactions/amount-input'
import { PrimaryButton } from '@/components/transactions/primary-button'
import { useContributeGoal } from '@/lib/hooks/use-goals'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalId: string
  goalTitle?: string
}

function parseAmountInput(raw: string): number | null {
  if (!raw.trim()) return null
  const n = parseFloat(raw.replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 100) / 100
}

function ContributeFormInner({
  goalId,
  goalTitle,
  onClose,
}: {
  goalId: string
  goalTitle?: string
  onClose: () => void
}) {
  const contributeMutation = useContributeGoal()
  const [amount, setAmount] = React.useState('')
  const [amountError, setAmountError] = React.useState<string>()

  const parsedAmount = parseAmountInput(amount)
  const canSave = parsedAmount != null && !contributeMutation.isPending

  const handleSave = async () => {
    setAmountError(undefined)

    if (parsedAmount == null) {
      setAmountError('Contribution amount must be greater than 0')
      return
    }

    try {
      await contributeMutation.mutateAsync({
        id: goalId,
        amount: parsedAmount,
      })
      toast.success('Contribution logged')
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not log contribution'
      )
    }
  }

  return (
    <>
      <BottomSheetHeader className="pr-12">
        <BottomSheetTitle>Log contribution</BottomSheetTitle>
        <BottomSheetDescription>
          {goalTitle
            ? `Add funds to "${goalTitle}".`
            : 'Add funds to your savings goal.'}
        </BottomSheetDescription>
      </BottomSheetHeader>

      <BottomSheetBody>
        <AmountInput
          id="contribution-amount"
          label="Contribution amount"
          value={amount}
          onChange={(v) => {
            setAmount(v)
            setAmountError(undefined)
          }}
          error={amountError}
          disabled={contributeMutation.isPending}
          autoFocus
        />
      </BottomSheetBody>

      <BottomSheetFooter>
        <PrimaryButton
          type="button"
          onClick={() => void handleSave()}
          loading={contributeMutation.isPending}
          disabled={!canSave}
        >
          Add Contribution
        </PrimaryButton>
      </BottomSheetFooter>
    </>
  )
}

export function ContributeSheet({
  open,
  onOpenChange,
  goalId,
  goalTitle,
}: Props) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        {open && goalId ? (
          <ContributeFormInner
            key={`contribute-${goalId}-${open}`}
            goalId={goalId}
            goalTitle={goalTitle}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </BottomSheetContent>
    </BottomSheet>
  )
}

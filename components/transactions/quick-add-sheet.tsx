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
import {
  AmountInput,
  CategoryPills,
  CategoryPillsSkeleton,
  DateField,
  DescriptionInput,
  PaymentMethodSelect,
  PrimaryButton,
  SecondaryButton,
  TypeToggle,
} from '@/components/transactions'
import { useCategoriesByType } from '@/lib/hooks/use-categories'
import { useProfile } from '@/lib/hooks/use-profile'
import { useCreateTransaction } from '@/lib/hooks/use-transactions'
import { getMruCategoryIds, pushMruCategoryId } from '@/lib/mru-categories'
import { useQuickAddDraftStore, useUIStore } from '@/lib/store'
import { formatNGN } from '@/lib/utils'
import type { PaymentMethod, TransactionType } from '@/lib/types/database'

/**
 * Primary logging flow (APP_FLOW FLOW 1).
 * Draft isolated in ledger-quick-add-draft — never used for edit.
 */
export function QuickAddSheet() {
  const open = useUIStore((s) => s.quickAddOpen)
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen)

  const draft = useQuickAddDraftStore((s) => s.draft)
  const openedWithDraft = useQuickAddDraftStore((s) => s.openedWithDraft)
  const setDraft = useQuickAddDraftStore((s) => s.setDraft)
  const clearDraft = useQuickAddDraftStore((s) => s.clearDraft)
  const ensureDraftForOpen = useQuickAddDraftStore((s) => s.ensureDraftForOpen)

  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [mruIds, setMruIds] = React.useState(() =>
    typeof window !== 'undefined' ? getMruCategoryIds() : []
  )
  const [amountError, setAmountError] = React.useState<string | undefined>()
  const [categoryError, setCategoryError] = React.useState<string | undefined>()
  const amountRef = React.useRef<HTMLInputElement>(null)
  const wasOpen = React.useRef(false)

  const { categories, isLoading: categoriesLoading } = useCategoriesByType(
    draft.type
  )
  const { data: profile } = useProfile()
  const createMutation = useCreateTransaction()

  // Focus amount when sheet opens — delay past Vaul's focus trap so the input
  // receives focus, not the whole drawer panel (avoids full-panel orange ring).
  React.useEffect(() => {
    if (open && !wasOpen.current) {
      setMruIds(getMruCategoryIds())
      const t = window.setTimeout(() => {
        amountRef.current?.focus({ preventScroll: true })
      }, 120)
      wasOpen.current = true
      return () => window.clearTimeout(t)
    }
    if (!open) {
      wasOpen.current = false
    }
  }, [open])

  const amountNum = parseFloat(draft.amount.replace(/,/g, ''))
  const amountValid = Number.isFinite(amountNum) && amountNum > 0
  const categoryValid = Boolean(draft.category_id)
  const canSave = amountValid && categoryValid && !createMutation.isPending

  const handleTypeChange = (type: TransactionType) => {
    setDraft({
      type,
      category_id: type === draft.type ? draft.category_id : null,
    })
    setCategoryError(undefined)
  }

  const validate = () => {
    let ok = true
    if (!amountValid) {
      setAmountError('Enter an amount greater than 0')
      ok = false
    } else {
      setAmountError(undefined)
    }
    if (!categoryValid) {
      setCategoryError('Pick a category')
      ok = false
    } else {
      setCategoryError(undefined)
    }
    return ok
  }

  const submit = async () => {
    if (!validate() || !draft.category_id) return

    const payload = {
      amount: amountNum,
      type: draft.type,
      category_id: draft.category_id,
      transaction_date: draft.transaction_date,
      description: draft.description || null,
      notes: draft.notes || null,
      payment_method: draft.payment_method,
      tags: draft.tags.length ? draft.tags : null,
    }

    try {
      setQuickAddOpen(false)
      const created = await createMutation.mutateAsync(payload)
      pushMruCategoryId(created.category_id)
      setMruIds(getMruCategoryIds())
      clearDraft()
      setShowAdvanced(false)

      const catName = created.categories?.name ?? 'category'
      toast.success(`${formatNGN(created.amount)} logged to ${catName}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save. Tap to retry.'
      setQuickAddOpen(true)
      toast.error(message, {
        duration: 6000,
        action: {
          label: 'Retry',
          onClick: () => {
            void submit()
          },
        },
      })
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (next) {
      ensureDraftForOpen(profile?.default_payment_method)
      setAmountError(undefined)
      setCategoryError(undefined)
    } else {
      if (!draft.isDirty) {
        clearDraft()
      }
      setShowAdvanced(false)
      setAmountError(undefined)
      setCategoryError(undefined)
    }
    setQuickAddOpen(next)
  }

  const handleDiscard = () => {
    clearDraft()
    setAmountError(undefined)
    setCategoryError(undefined)
    setShowAdvanced(false)
    setQuickAddOpen(false)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      dismissible={!createMutation.isPending}
    >
      <BottomSheetContent showClose>
        <BottomSheetHeader className="pr-12">
          <BottomSheetTitle>Log transaction</BottomSheetTitle>
          <BottomSheetDescription>
            Amount first — save in under 10 seconds.
          </BottomSheetDescription>
          {openedWithDraft && draft.isDirty ? (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-amber/40 bg-amber-muted px-3 py-2">
              <p className="text-xs font-medium text-amber">Draft restored</p>
              <button
                type="button"
                onClick={handleDiscard}
                className="min-h-9 rounded-md px-2 text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer"
              >
                Discard
              </button>
            </div>
          ) : null}
        </BottomSheetHeader>

        <BottomSheetBody>
          <AmountInput
            ref={amountRef}
            value={draft.amount}
            onChange={(amount) => {
              setDraft({ amount })
              if (amountError) setAmountError(undefined)
            }}
            error={amountError}
          />

          <TypeToggle value={draft.type} onChange={handleTypeChange} />

          {categoriesLoading ? (
            <CategoryPillsSkeleton />
          ) : (
            <CategoryPills
              categories={categories}
              value={draft.category_id}
              mruIds={mruIds}
              error={categoryError}
              onChange={(category_id) => {
                setDraft({ category_id })
                if (categoryError) setCategoryError(undefined)
              }}
            />
          )}

          <PaymentMethodSelect
            value={draft.payment_method}
            onChange={(payment_method: PaymentMethod | null) =>
              setDraft({ payment_method })
            }
          />

          <DateField
            value={draft.transaction_date}
            onChange={(transaction_date) => setDraft({ transaction_date })}
          />

          <DescriptionInput
            value={draft.description}
            onChange={(description) => setDraft({ description })}
          />

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="self-start text-sm font-medium text-azure hover:underline cursor-pointer min-h-10"
          >
            {showAdvanced ? 'Hide notes' : 'Add notes'}
          </button>

          {showAdvanced ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="quick-add-notes"
                className="text-sm font-medium text-text-secondary"
              >
                Notes{' '}
                <span className="font-normal text-text-tertiary">(optional)</span>
              </label>
              <textarea
                id="quick-add-notes"
                value={draft.notes}
                onChange={(e) => setDraft({ notes: e.target.value })}
                rows={3}
                maxLength={2000}
                placeholder="Extra context…"
                className="w-full rounded-lg border border-border bg-bg-surface px-3.5 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-orange focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-orange resize-y min-h-[88px]"
              />
            </div>
          ) : null}
        </BottomSheetBody>

        <BottomSheetFooter className="flex-col sm:flex-col">
          <PrimaryButton
            onClick={() => void submit()}
            disabled={!canSave}
            loading={createMutation.isPending}
          >
            Save
          </PrimaryButton>
          {draft.isDirty ? (
            <SecondaryButton type="button" onClick={handleDiscard}>
              Discard draft
            </SecondaryButton>
          ) : null}
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}

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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { TypeToggle } from '@/components/transactions/type-toggle'
import { PrimaryButton } from '@/components/transactions/primary-button'
import {
  useCreateCategory,
  useRenameCategory,
} from '@/lib/hooks/use-categories'
import {
  CATEGORY_ICON_OPTIONS,
  CATEGORY_PALETTE,
  DEFAULT_CATEGORY_COLOR,
} from '@/lib/category-palette'
import type { Category, TransactionType } from '@/lib/types/database'
import { cn } from '@/lib/utils'

export type CategoryFormMode =
  | { kind: 'create' }
  | { kind: 'edit'; category: Category }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: CategoryFormMode | null
}

function CategoryFormInner({
  mode,
  onClose,
}: {
  mode: CategoryFormMode
  onClose: () => void
}) {
  const createMutation = useCreateCategory()
  const renameMutation = useRenameCategory()

  const isEdit = mode.kind === 'edit'
  const editing = mode.kind === 'edit' ? mode.category : null

  const [name, setName] = React.useState(() =>
    isEdit && editing ? editing.name : ''
  )
  const [type, setType] = React.useState<TransactionType>(() =>
    isEdit && editing ? editing.type : 'expense'
  )
  const [color, setColor] = React.useState(() =>
    isEdit && editing
      ? editing.color || DEFAULT_CATEGORY_COLOR
      : DEFAULT_CATEGORY_COLOR
  )
  const [icon, setIcon] = React.useState<string | null>(() =>
    isEdit && editing ? editing.icon : null
  )
  const [nameError, setNameError] = React.useState<string>()

  const pending = createMutation.isPending || renameMutation.isPending
  const canSave = name.trim().length > 0 && !pending

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Name is required')
      return
    }

    try {
      if (isEdit && editing) {
        await renameMutation.mutateAsync({
          id: editing.id,
          name: trimmed,
          color,
          icon,
        })
        toast.success('Category updated')
      } else {
        await createMutation.mutateAsync({
          name: trimmed,
          type,
          color,
          icon,
        })
        toast.success('Category created')
      }
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not save category'
      )
    }
  }

  return (
    <>
      <BottomSheetHeader className="pr-12">
        <BottomSheetTitle>
          {isEdit ? 'Edit category' : 'New category'}
        </BottomSheetTitle>
        <BottomSheetDescription>
          {isEdit
            ? 'Rename and restyle. Transactions keep this category.'
            : 'Used when logging income and expenses.'}
        </BottomSheetDescription>
      </BottomSheetHeader>

      <BottomSheetBody>
        <Field>
          <FieldLabel htmlFor="cat-name" required>
            Name
          </FieldLabel>
          <input
            id="cat-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError(undefined)
            }}
            maxLength={60}
            placeholder="e.g. Side hustle"
            disabled={pending}
            className={cn(
              'h-12 min-h-[48px] w-full rounded-lg border bg-bg-surface px-3.5 text-base text-text-primary',
              'placeholder:text-text-tertiary border-border',
              'focus:border-orange focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-orange',
              nameError && 'border-red'
            )}
          />
          <FieldError>{nameError}</FieldError>
        </Field>

        {!isEdit ? (
          <TypeToggle value={type} onChange={setType} disabled={pending} />
        ) : (
          <p className="text-sm text-text-secondary">
            Type:{' '}
            <span className="font-medium capitalize text-text-primary">
              {editing?.type}
            </span>
            <span className="text-text-tertiary"> (fixed)</span>
          </p>
        )}

        <Field>
          <FieldLabel id="cat-color-label">Color</FieldLabel>
          <div
            role="listbox"
            aria-labelledby="cat-color-label"
            className="grid grid-cols-6 gap-2"
          >
            {CATEGORY_PALETTE.map((c) => {
              const selected = color.toLowerCase() === c.toLowerCase()
              return (
                <button
                  key={c}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={`Color ${c}`}
                  disabled={pending}
                  onClick={() => setColor(c)}
                  className={cn(
                    'flex h-11 w-full items-center justify-center rounded-lg border-2 transition-transform cursor-pointer',
                    selected
                      ? 'border-orange scale-105'
                      : 'border-transparent hover:border-border-strong'
                  )}
                >
                  <span
                    className="h-7 w-7 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                </button>
              )
            })}
          </div>
        </Field>

        <Field>
          <FieldLabel id="cat-icon-label">
            Icon{' '}
            <span className="font-normal text-text-tertiary">(optional)</span>
          </FieldLabel>
          <div
            role="listbox"
            aria-labelledby="cat-icon-label"
            className="flex flex-wrap gap-2"
          >
            {CATEGORY_ICON_OPTIONS.map((opt) => {
              const selected = icon === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={pending}
                  onClick={() => setIcon(selected ? null : opt.id)}
                  className={cn(
                    'min-h-10 rounded-full border px-3 text-sm font-medium cursor-pointer',
                    selected
                      ? 'border-azure bg-azure-muted text-azure'
                      : 'border-border bg-bg-surface text-text-secondary hover:text-text-primary'
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </Field>
      </BottomSheetBody>

      <BottomSheetFooter>
        <PrimaryButton
          onClick={() => void handleSave()}
          disabled={!canSave}
          loading={pending}
        >
          {isEdit ? 'Save' : 'Create'}
        </PrimaryButton>
      </BottomSheetFooter>
    </>
  )
}

export function CategoryFormSheet({ open, onOpenChange, mode }: Props) {
  const innerKey =
    mode?.kind === 'edit'
      ? `edit-${mode.category.id}`
      : mode?.kind === 'create'
        ? 'create'
        : 'closed'

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent showClose>
        {open && mode ? (
          <CategoryFormInner
            key={innerKey}
            mode={mode}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </BottomSheetContent>
    </BottomSheet>
  )
}

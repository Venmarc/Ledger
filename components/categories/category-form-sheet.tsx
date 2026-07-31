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
  DEFAULT_EXPENSE_ICONS,
  DEFAULT_INCOME_ICONS,
  CURATED_EXPENSE_ICONS,
  CURATED_INCOME_ICONS,
  type IconOption,
} from '@/lib/category-icons'
import { CategoryIcon } from '@/components/categories/category-icon'
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

  const availableIcons: IconOption[] = React.useMemo(() => {
    if (type === 'income') {
      return [...DEFAULT_INCOME_ICONS, ...CURATED_INCOME_ICONS]
    }
    return [...DEFAULT_EXPENSE_ICONS, ...CURATED_EXPENSE_ICONS]
  }, [type])

  const [icon, setIcon] = React.useState<string>(() => {
    if (isEdit && editing && editing.icon) return editing.icon
    return availableIcons[0]?.name || 'CircleDot'
  })

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    const icons =
      newType === 'income'
        ? [...DEFAULT_INCOME_ICONS, ...CURATED_INCOME_ICONS]
        : [...DEFAULT_EXPENSE_ICONS, ...CURATED_EXPENSE_ICONS]
    setIcon(icons[0]?.name || 'CircleDot')
  }

  const [nameError, setNameError] = React.useState<string>()

  const pending = createMutation.isPending || renameMutation.isPending
  const canSave = name.trim().length > 0 && Boolean(icon) && !pending

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
          icon,
        })
        toast.success('Category updated')
      } else {
        await createMutation.mutateAsync({
          name: trimmed,
          type,
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
            ? 'Rename and change icon. Transactions keep this category.'
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
          <TypeToggle value={type} onChange={handleTypeChange} disabled={pending} />
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
          <FieldLabel id="cat-icon-label" required>
            Icon
          </FieldLabel>
          <div
            role="listbox"
            aria-labelledby="cat-icon-label"
            className="grid grid-cols-4 gap-2 sm:grid-cols-6 max-h-56 overflow-y-auto p-1 rounded-lg border border-border bg-bg-surface"
          >
            {availableIcons.map((opt) => {
              const selected = icon === opt.name
              const IconComp = opt.icon
              return (
                <button
                  key={opt.name}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={`Icon ${opt.label}`}
                  disabled={pending}
                  onClick={() => setIcon(opt.name)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-colors cursor-pointer',
                    selected
                      ? 'border-orange bg-neutral-muted text-orange font-medium'
                      : 'border-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                  )}
                >
                  <IconComp className="h-5 w-5 mb-1 shrink-0" />
                  <span className="text-[10px] leading-tight truncate w-full">
                    {opt.label}
                  </span>
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

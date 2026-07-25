'use client'

import * as React from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  CategoryFormSheet,
  type CategoryFormMode,
} from '@/components/categories/category-form-sheet'
import { PrimaryButton } from '@/components/transactions/primary-button'
import {
  useArchiveCategory,
  useCategories,
  useRestoreCategory,
} from '@/lib/hooks/use-categories'
import type { Category } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/components/categories/category-icon'
import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
} from 'lucide-react'

function CategoryRow({
  category,
  onEdit,
  onArchive,
  onRestore,
  archiveDisabled,
}: {
  category: Category
  onEdit?: () => void
  onArchive?: () => void
  onRestore?: () => void
  archiveDisabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-surface px-3 py-3">
      <CategoryIcon iconName={category.icon} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-text-primary">
            {category.name}
          </p>
          {category.is_default ? (
            <span className="rounded-md border border-border bg-bg-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
              Default
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary hover:bg-bg-subtle hover:text-text-primary cursor-pointer"
            aria-label={`Edit ${category.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : null}
        {onArchive ? (
          <button
            type="button"
            onClick={onArchive}
            disabled={archiveDisabled}
            title={
              archiveDisabled
                ? 'Default categories cannot be archived'
                : `Archive ${category.name}`
            }
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full cursor-pointer',
              archiveDisabled
                ? 'text-text-tertiary opacity-40 cursor-not-allowed'
                : 'text-text-secondary hover:bg-red-muted hover:text-red'
            )}
            aria-label={`Archive ${category.name}`}
          >
            <Archive className="h-4 w-4" />
          </button>
        ) : null}
        {onRestore ? (
          <button
            type="button"
            onClick={onRestore}
            className="flex h-11 w-11 items-center justify-center rounded-full text-azure hover:bg-azure-muted cursor-pointer"
            aria-label={`Restore ${category.name}`}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function CategorySection({
  title,
  categories,
  onEdit,
  onArchive,
}: {
  title: string
  categories: Category[]
  onEdit: (c: Category) => void
  onArchive: (c: Category) => void
}) {
  if (categories.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          {title}
        </h2>
        <p className="text-sm text-text-secondary px-1">None yet.</p>
      </section>
    )
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
        {title}
      </h2>
      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id}>
            <CategoryRow
              category={c}
              onEdit={() => onEdit(c)}
              onArchive={() => onArchive(c)}
              archiveDisabled={c.is_default}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CategoriesManager() {
  const { data, isLoading, isError, error, refetch } = useCategories({
    includeArchived: true,
  })
  const archiveMutation = useArchiveCategory()
  const restoreMutation = useRestoreCategory()

  const [formMode, setFormMode] = React.useState<CategoryFormMode | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [archiveTarget, setArchiveTarget] = React.useState<Category | null>(
    null
  )
  const [archivedOpen, setArchivedOpen] = React.useState(false)

  const all = data ?? []
  const expenses = all.filter((c) => !c.is_archived && c.type === 'expense')
  const incomes = all.filter((c) => !c.is_archived && c.type === 'income')
  const archived = all.filter((c) => c.is_archived)

  const openCreate = () => {
    setFormMode({ kind: 'create' })
    setSheetOpen(true)
  }

  const openEdit = (category: Category) => {
    setFormMode({ kind: 'edit', category })
    setSheetOpen(true)
  }

  const handleArchive = async () => {
    if (!archiveTarget) return
    try {
      await archiveMutation.mutateAsync(archiveTarget.id)
      toast.success(`${archiveTarget.name} archived`)
      setArchiveTarget(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not archive category'
      )
    }
  }

  const handleRestore = async (category: Category) => {
    try {
      await restoreMutation.mutateAsync(category.id)
      toast.success(`${category.name} restored`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not restore category'
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 text-text-tertiary">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red/40 bg-red-muted px-4 py-8 text-center">
        <p className="text-sm text-red">
          {error instanceof Error
            ? error.message
            : 'Could not load categories.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 min-h-11 text-sm font-semibold text-azure cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/settings"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-text-secondary hover:bg-bg-subtle hover:text-text-primary cursor-pointer -ml-2"
          aria-label="Back to Settings"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="mt-1 text-2xl font-bold font-display text-text-primary md:text-3xl">
          Categories
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Organize how you classify income and spending.
        </p>
      </div>

      <CategorySection
        title="Expenses"
        categories={expenses}
        onEdit={openEdit}
        onArchive={setArchiveTarget}
      />

      <CategorySection
        title="Income"
        categories={incomes}
        onEdit={openEdit}
        onArchive={setArchiveTarget}
      />

      {archived.length > 0 ? (
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => setArchivedOpen((v) => !v)}
            className="flex w-full min-h-11 items-center gap-2 text-left text-sm font-semibold uppercase tracking-wide text-text-tertiary cursor-pointer"
            aria-expanded={archivedOpen}
          >
            {archivedOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Archived ({archived.length})
          </button>
          {archivedOpen ? (
            <ul className="space-y-2">
              {archived.map((c) => (
                <li key={c.id}>
                  <CategoryRow
                    category={c}
                    onRestore={() => void handleRestore(c)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <PrimaryButton
        onClick={openCreate}
        className="gap-2"
      >
        <Plus className="h-5 w-5" aria-hidden />
        New Category
      </PrimaryButton>

      <CategoryFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) setFormMode(null)
        }}
        mode={formMode}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null)
        }}
        title="Archive category?"
        description={
          archiveTarget
            ? `Archive ${archiveTarget.name}? Existing transactions keep this category. You won't see it in new transaction forms.`
            : ''
        }
        confirmLabel="Archive"
        variant="destructive"
        loading={archiveMutation.isPending}
        onConfirm={() => void handleArchive()}
      />
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types/database'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { CategoryIcon } from '@/components/categories/category-icon'

type CategoryPillsProps = {
  categories: Category[]
  value: string | null
  onChange: (categoryId: string) => void
  /** Most-recently-used ids float to top (Quick Add) */
  mruIds?: string[]
  error?: string
  disabled?: boolean
  className?: string
  label?: string
}

function sortWithMru(categories: Category[], mruIds: string[] = []) {
  if (!mruIds.length) return categories
  const rank = new Map(mruIds.map((id, i) => [id, i]))
  return [...categories].sort((a, b) => {
    const ra = rank.has(a.id) ? rank.get(a.id)! : 999
    const rb = rank.has(b.id) ? rank.get(b.id)! : 999
    if (ra !== rb) return ra - rb
    return a.name.localeCompare(b.name)
  })
}

/** Pill grid category selector — name always visible (Smart-Form-Controls). */
export function CategoryPills({
  categories,
  value,
  onChange,
  mruIds,
  error,
  disabled,
  className,
  label = 'Category',
}: CategoryPillsProps) {
  const ordered = sortWithMru(categories, mruIds)

  return (
    <Field className={className}>
      <FieldLabel id="category-pills-label" required>
        {label}
      </FieldLabel>
      {ordered.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          No categories yet. Add some in Settings.
        </p>
      ) : (
        <div
          role="listbox"
          aria-labelledby="category-pills-label"
          aria-required
          className="flex max-h-36 flex-wrap gap-2 overflow-y-auto overscroll-contain py-0.5"
        >
          {ordered.map((cat) => {
            const selected = value === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                onClick={() => onChange(cat.id)}
                className={cn(
                  'inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer bg-neutral-muted',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  selected
                    ? 'border-[1.5px] border-orange font-medium text-orange'
                    : 'border-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                )}
              >
                <CategoryIcon
                  iconName={cat.icon}
                  size="sm"
                  className="h-5 w-5 bg-transparent p-0 text-current"
                />
                <span className="truncate">{cat.name}</span>
              </button>
            )
          })}
        </div>
      )}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

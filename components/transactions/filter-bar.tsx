'use client'

import * as React from 'react'
import { Filter, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  countSheetFilters,
  DATE_RANGE_LABELS,
  isDefaultSheetFilters,
} from '@/lib/filters'
import { useCategories } from '@/lib/hooks/use-categories'
import { useTransactionFilterStore } from '@/lib/store'
import {
  DEFAULT_TRANSACTION_FILTERS,
  PAYMENT_METHODS,
  type Category,
  type DateRangePreset,
  type PaymentMethod,
  type TransactionListFilters,
  type TransactionType,
} from '@/lib/types/database'
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet'
import { CategoryIcon } from '@/components/categories/category-icon'
import { PrimaryButton, SecondaryButton } from '@/components/transactions/primary-button'

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: '3 Months' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
]

const TYPE_OPTIONS: { value: 'all' | TransactionType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

function categoriesForType(
  categories: Category[],
  type: 'all' | TransactionType
): { income: Category[]; expense: Category[] } {
  const active = categories.filter((c) => !c.is_archived)
  const sortAlpha = (a: Category, b: Category) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  const income = active.filter((c) => c.type === 'income').sort(sortAlpha)
  const expense = active.filter((c) => c.type === 'expense').sort(sortAlpha)
  if (type === 'income') return { income, expense: [] }
  if (type === 'expense') return { income: [], expense }
  return { income, expense }
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex w-full flex-wrap gap-1 rounded-xl border border-border bg-bg-subtle p-1 shadow-card"
    >
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'pressable min-h-10 flex-1 rounded-lg px-2.5 text-sm font-medium cursor-pointer',
              'transition-[background-color,color,box-shadow] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
              active
                ? 'bg-bg-surface text-text-primary shadow-card'
                : 'text-text-tertiary hover:text-text-secondary'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function ChipButton({
  children,
  onRemove,
  label,
}: {
  children: React.ReactNode
  onRemove: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter ${label}`}
      className={cn(
        'pressable inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-amber/40 bg-amber-muted px-3 text-sm font-medium text-amber cursor-pointer',
        'transition-[transform,background-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]'
      )}
    >
      <span className="max-w-[10rem] truncate">{children}</span>
      <X className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
    </button>
  )
}

type DraftFilters = Pick<
  TransactionListFilters,
  | 'dateRange'
  | 'customFrom'
  | 'customTo'
  | 'type'
  | 'categoryIds'
  | 'paymentMethod'
>

function sheetDraftFrom(filters: TransactionListFilters): DraftFilters {
  return {
    dateRange: filters.dateRange,
    customFrom: filters.customFrom,
    customTo: filters.customTo,
    type: filters.type,
    categoryIds: filters.categoryIds,
    paymentMethod: filters.paymentMethod,
  }
}

function FilterSheet({
  open,
  onOpenChange,
  draft,
  setDraft,
  categories,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: DraftFilters
  setDraft: React.Dispatch<React.SetStateAction<DraftFilters>>
  categories: Category[]
}) {
  const setFilters = useTransactionFilterStore((s) => s.setFilters)

  const patch = (p: Partial<DraftFilters>) =>
    setDraft((d) => ({ ...d, ...p }))

  const setType = (type: DraftFilters['type']) => {
    setDraft((d) => {
      const next = { ...d, type }
      if (d.categoryIds.length > 0) {
        const groups = categoriesForType(categories, type)
        const allowed = new Set(
          [...groups.income, ...groups.expense].map((c) => c.id)
        )
        const kept = d.categoryIds.filter((id) => allowed.has(id))
        // Spec: clear invalid category when type changes
        next.categoryIds = kept
      }
      return next
    })
  }

  const selectCategory = (id: string) => {
    setDraft((d) => ({
      ...d,
      // Single-select per Transaction_UI_Spec
      categoryIds: d.categoryIds[0] === id ? [] : [id],
    }))
  }

  const groups = categoriesForType(categories, draft.type)
  const selectedCategoryId = draft.categoryIds[0] ?? null

  const apply = () => {
    setFilters({
      dateRange: draft.dateRange,
      customFrom: draft.customFrom,
      customTo: draft.customTo,
      type: draft.type,
      categoryIds: draft.categoryIds,
      paymentMethod: draft.paymentMethod,
    })
    onOpenChange(false)
  }

  const reset = () => {
    // Sheet Reset clears structured filters only; search stays in the control row.
    const cleared: DraftFilters = {
      dateRange: DEFAULT_TRANSACTION_FILTERS.dateRange,
      customFrom: null,
      customTo: null,
      type: 'all',
      categoryIds: [],
      paymentMethod: 'all',
    }
    setDraft(cleared)
    setFilters(cleared)
    onOpenChange(false)
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent showClose className="flex max-h-[92vh] flex-col">
        <BottomSheetHeader className="pr-12">
          <BottomSheetTitle>Filters</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody className="gap-5 pb-4">
          {/* Date range */}
          <section className="space-y-2 entrance-blur-in">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Date range
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {DATE_PRESETS.map((p) => {
                const active = draft.dateRange === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() =>
                      patch({
                        dateRange: p.value,
                        ...(p.value !== 'custom'
                          ? { customFrom: null, customTo: null }
                          : {}),
                      })
                    }
                    className={cn(
                      'pressable min-h-10 rounded-full border px-3 text-sm font-medium cursor-pointer',
                      active
                        ? 'border-amber bg-amber-muted text-amber'
                        : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
            <div className="reveal-grid" data-open={draft.dateRange === 'custom' ? 'true' : 'false'}>
              <div className="reveal-grid-inner">
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-xs text-text-secondary">
                    From
                    <input
                      type="date"
                      value={draft.customFrom ?? ''}
                      onChange={(e) =>
                        patch({ customFrom: e.target.value || null })
                      }
                      className="min-h-11 rounded-lg border border-border bg-bg-surface px-2 text-sm text-text-primary focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/35"
                    />
                  </label>
                  <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-xs text-text-secondary">
                    To
                    <input
                      type="date"
                      value={draft.customTo ?? ''}
                      onChange={(e) =>
                        patch({ customTo: e.target.value || null })
                      }
                      className="min-h-11 rounded-lg border border-border bg-bg-surface px-2 text-sm text-text-primary focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/35"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Type — segmented, not a slider (spec §4) */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Type
            </h3>
            <Segmented
              ariaLabel="Transaction type"
              value={draft.type}
              options={TYPE_OPTIONS}
              onChange={setType}
            />
          </section>

          {/* Category — reactive to type */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Category
            </h3>
            {draft.type === 'all' ? (
              <div className="space-y-3">
                {groups.income.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="sticky top-0 text-[11px] font-semibold uppercase tracking-wide text-green">
                      Income
                    </p>
                    <CategoryChipGrid
                      items={groups.income}
                      selectedId={selectedCategoryId}
                      onSelect={selectCategory}
                    />
                  </div>
                ) : null}
                {groups.expense.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="sticky top-0 text-[11px] font-semibold uppercase tracking-wide text-amber">
                      Expense
                    </p>
                    <CategoryChipGrid
                      items={groups.expense}
                      selectedId={selectedCategoryId}
                      onSelect={selectCategory}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <CategoryChipGrid
                items={
                  draft.type === 'income' ? groups.income : groups.expense
                }
                selectedId={selectedCategoryId}
                onSelect={selectCategory}
              />
            )}
            {groups.income.length + groups.expense.length === 0 ? (
              <p className="text-sm text-text-tertiary">No categories yet.</p>
            ) : null}
          </section>

          {/* Payment method */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Payment method
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => patch({ paymentMethod: 'all' })}
                className={cn(
                  'pressable min-h-10 rounded-full border px-3 text-sm font-medium cursor-pointer',
                  draft.paymentMethod === 'all'
                    ? 'border-amber bg-amber-muted text-amber'
                    : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong'
                )}
              >
                All
              </button>
              {PAYMENT_METHODS.map((m) => {
                const active = draft.paymentMethod === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      patch({
                        paymentMethod: active ? 'all' : (m as PaymentMethod),
                      })
                    }
                    className={cn(
                      'pressable min-h-10 rounded-full border px-3 text-sm font-medium cursor-pointer',
                      active
                        ? 'border-amber bg-amber-muted text-amber'
                        : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong'
                    )}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          </section>
        </BottomSheetBody>

        <BottomSheetFooter className="sticky bottom-0 z-10 flex-row gap-2">
          <SecondaryButton type="button" className="flex-1" onClick={reset}>
            Reset
          </SecondaryButton>
          <PrimaryButton type="button" className="flex-1" onClick={apply}>
            Apply
          </PrimaryButton>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}

function CategoryChipGrid({
  items,
  selectedId,
  onSelect,
}: {
  items: Category[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((cat) => {
        const active = selectedId === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              'pressable inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium cursor-pointer',
              active
                ? 'border-amber bg-amber-muted text-amber'
                : 'border-border bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'
            )}
          >
            <CategoryIcon
              iconName={cat.icon}
              size="sm"
              className="h-5 w-5 bg-transparent p-0 text-current"
            />
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Control row: [ search flex-grow ] [ filter icon ]
 * + conditional active filter chips
 * Heavy filters live in the sheet (Transaction_UI_Spec).
 */
export function TransactionFilterBar() {
  const filters = useTransactionFilterStore((s) => s.filters)
  const setFilters = useTransactionFilterStore((s) => s.setFilters)
  const { data: categories = [] } = useCategories({ includeArchived: false })

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<DraftFilters>(() =>
    sheetDraftFrom(filters)
  )
  /** Draft text while focused; store value when blurred (stays in sync on external reset). */
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [searchLocal, setSearchLocal] = React.useState(filters.search)
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchValue = searchFocused ? searchLocal : filters.search

  const openSheet = () => {
    setDraft(sheetDraftFrom(filters))
    setSheetOpen(true)
  }

  const onSearchChange = (value: string) => {
    setSearchLocal(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setFilters({ search: value })
    }, 300)
  }

  const clearSearch = () => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    setSearchLocal('')
    setFilters({ search: '' })
  }

  React.useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [])

  const sheetCount = countSheetFilters(filters)
  const showChips = !isDefaultSheetFilters(filters)

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? 'Category'

  const chips: { key: string; label: string; clear: () => void }[] = []
  if (
    filters.dateRange !== 'this_month' ||
    filters.customFrom ||
    filters.customTo
  ) {
    chips.push({
      key: 'date',
      label: DATE_RANGE_LABELS[filters.dateRange],
      clear: () =>
        setFilters({
          dateRange: 'this_month',
          customFrom: null,
          customTo: null,
        }),
    })
  }
  if (filters.type !== 'all') {
    chips.push({
      key: 'type',
      label: filters.type === 'income' ? 'Income' : 'Expense',
      clear: () => setFilters({ type: 'all', categoryIds: [] }),
    })
  }
  for (const id of filters.categoryIds) {
    chips.push({
      key: `cat-${id}`,
      label: categoryName(id),
      clear: () =>
        setFilters({
          categoryIds: filters.categoryIds.filter((x) => x !== id),
        }),
    })
  }
  if (filters.paymentMethod !== 'all') {
    chips.push({
      key: 'pay',
      label: filters.paymentMethod,
      clear: () => setFilters({ paymentMethod: 'all' }),
    })
  }

  return (
    <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-bg-base/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
      {/* Control row — single line, 375px safe */}
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => {
              setSearchLocal(filters.search)
              setSearchFocused(true)
            }}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search transactions…"
            aria-label="Search transactions"
            className={cn(
              'h-11 w-full rounded-lg border bg-bg-surface pl-10 text-base text-text-primary placeholder:text-text-tertiary shadow-card',
              'transition-[border-color,box-shadow] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
              searchValue.trim() ? 'pr-11 border-amber' : 'pr-3 border-border',
              'focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/35'
            )}
          />
          {searchValue.trim() ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="pressable absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary hover:bg-bg-subtle hover:text-text-primary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={openSheet}
          aria-label={
            sheetCount > 0
              ? `Open filters, ${sheetCount} active`
              : 'Open filters'
          }
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          className={cn(
            'pressable relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-surface text-text-secondary shadow-card cursor-pointer',
            'hover:border-border-strong hover:text-text-primary',
            'transition-[border-color,color,transform] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
            sheetCount > 0 && 'border-amber text-amber'
          )}
        >
          <Filter className="h-4 w-4" aria-hidden />
          {sheetCount > 0 ? (
            <span
              className={cn(
                'absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1',
                'text-[10px] font-bold tabular-nums text-orange-btn-text',
                'animate-[snap-pulse_220ms_var(--ease-spring)]'
              )}
              aria-hidden
            >
              {sheetCount > 9 ? '9+' : sheetCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Active filter chips — only when non-default sheet filters */}
      {showChips ? (
        <div className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {chips.map((chip) => (
            <ChipButton
              key={chip.key}
              label={chip.label}
              onRemove={chip.clear}
            >
              {chip.label}
            </ChipButton>
          ))}
        </div>
      ) : null}

      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        draft={draft}
        setDraft={setDraft}
        categories={categories}
      />
    </div>
  )
}

'use server'

import { getAuthedContext } from '@/lib/actions/auth-context'
import { fail, ok, type ActionResult } from '@/lib/actions/result'
import { monthEnd, monthStart, resolveDateRange } from '@/lib/dates'
import type {
  MonthSummary,
  Transaction,
  TransactionListFilters,
  TransactionWithCategory,
} from '@/lib/types/database'
import {
  createTransactionSchema,
  restoreTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type RestoreTransactionInput,
  type UpdateTransactionInput,
} from '@/lib/validations/transaction'

const CATEGORY_SELECT = `
  id,
  name,
  icon,
  type,
  is_default,
  is_archived
`

const TRANSACTION_WITH_CATEGORY = `
  *,
  categories ( ${CATEGORY_SELECT} )
`

const PAGE_SIZE = 20

function parseAmount(value: string | number): number {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function toInsertRow(
  userId: string,
  input: CreateTransactionInput,
  id?: string
) {
  return {
    ...(id ? { id } : {}),
    user_id: userId,
    amount: input.amount,
    type: input.type,
    category_id: input.category_id,
    transaction_date: input.transaction_date,
    description: input.description?.trim() || null,
    notes: input.notes?.trim() || null,
    payment_method: input.payment_method ?? null,
    tags: input.tags?.length ? input.tags : null,
    recurring_id: input.recurring_id ?? null,
  }
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<ActionResult<TransactionWithCategory>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = createTransactionSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid transaction')
  }

  const { data, error } = await ctx.supabase
    .from('transactions')
    .insert(toInsertRow(ctx.userId, parsed.data))
    .select(TRANSACTION_WITH_CATEGORY)
    .single()

  if (error) {
    console.error('createTransaction:', error)
    return fail('Could not save transaction')
  }

  return ok(data as unknown as TransactionWithCategory)
}

export async function updateTransaction(
  input: UpdateTransactionInput
): Promise<ActionResult<TransactionWithCategory>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = updateTransactionSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid update')
  }

  const { id, ...rest } = parsed.data
  if (Object.keys(rest).length === 0) {
    return fail('No changes to save')
  }

  const patch: Record<string, unknown> = {}
  if (rest.amount !== undefined) patch.amount = rest.amount
  if (rest.type !== undefined) patch.type = rest.type
  if (rest.category_id !== undefined) patch.category_id = rest.category_id
  if (rest.transaction_date !== undefined)
    patch.transaction_date = rest.transaction_date
  if (rest.description !== undefined)
    patch.description = rest.description?.trim() || null
  if (rest.notes !== undefined) patch.notes = rest.notes?.trim() || null
  if (rest.payment_method !== undefined)
    patch.payment_method = rest.payment_method ?? null
  if (rest.tags !== undefined)
    patch.tags = rest.tags?.length ? rest.tags : null
  if (rest.recurring_id !== undefined)
    patch.recurring_id = rest.recurring_id ?? null

  const { data, error } = await ctx.supabase
    .from('transactions')
    .update(patch)
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .select(TRANSACTION_WITH_CATEGORY)
    .single()

  if (error) {
    console.error('updateTransaction:', error)
    return fail('Could not update transaction')
  }

  return ok(data as unknown as TransactionWithCategory)
}

export async function deleteTransaction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const { error } = await ctx.supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', ctx.userId)

  if (error) {
    console.error('deleteTransaction:', error)
    return fail('Could not delete transaction')
  }

  return ok({ id })
}

/** Re-insert a deleted row (undo). Preserves original id when provided. */
export async function restoreTransaction(
  input: RestoreTransactionInput
): Promise<ActionResult<TransactionWithCategory>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = restoreTransactionSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid restore payload')
  }

  const { id, ...fields } = parsed.data

  const { data, error } = await ctx.supabase
    .from('transactions')
    .insert(toInsertRow(ctx.userId, fields, id))
    .select(TRANSACTION_WITH_CATEGORY)
    .single()

  if (error) {
    console.error('restoreTransaction:', error)
    return fail('Could not restore transaction')
  }

  return ok(data as unknown as TransactionWithCategory)
}

export async function getTransaction(
  id: string
): Promise<ActionResult<TransactionWithCategory | null>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const { data, error } = await ctx.supabase
    .from('transactions')
    .select(TRANSACTION_WITH_CATEGORY)
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (error) {
    console.error('getTransaction:', error)
    return fail('Could not load transaction')
  }

  return ok((data as unknown as TransactionWithCategory) ?? null)
}

export type ListTransactionsParams = {
  filters: TransactionListFilters
  /** Page index starting at 0 */
  page?: number
  pageSize?: number
}

export type ListTransactionsResult = {
  items: TransactionWithCategory[]
  page: number
  pageSize: number
  hasMore: boolean
  /** Approximate total matching rows (from count) */
  total: number | null
}

export async function listTransactions(
  params: ListTransactionsParams
): Promise<ActionResult<ListTransactionsResult>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const page = Math.max(0, params.page ?? 0)
  const pageSize = params.pageSize ?? PAGE_SIZE
  const filters = params.filters
  const { from, to } = resolveDateRange(
    filters.dateRange,
    filters.customFrom,
    filters.customTo
  )

  let query = ctx.supabase
    .from('transactions')
    .select(TRANSACTION_WITH_CATEGORY, { count: 'exact' })
    .eq('user_id', ctx.userId)
    .gte('transaction_date', from)
    .lte('transaction_date', to)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1)

  if (filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  if (filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds)
  }

  if (filters.paymentMethod !== 'all') {
    query = query.eq('payment_method', filters.paymentMethod)
  }

  const search = filters.search?.trim()
  if (search) {
    // Escape LIKE metacharacters; commas break PostgREST or() lists
    const safe = search.replace(/[%_]/g, '\\$&').replace(/,/g, ' ')
    const pattern = `%${safe}%`

    // Category name match → "gift" finds Gift category transactions
    const { data: matchingCats } = await ctx.supabase
      .from('categories')
      .select('id')
      .eq('user_id', ctx.userId)
      .ilike('name', pattern)

    const catIds = (matchingCats ?? []).map((c) => c.id as string)
    const asNum = parseFloat(safe.replace(/,/g, ''))

    const orParts = [
      `description.ilike.${pattern}`,
      `notes.ilike.${pattern}`,
      `payment_method.ilike.${pattern}`,
      `type.ilike.${pattern}`,
    ]
    if (catIds.length > 0) {
      orParts.push(`category_id.in.(${catIds.join(',')})`)
    }
    if (Number.isFinite(asNum) && asNum > 0) {
      orParts.push(`amount.eq.${asNum}`)
    }

    query = query.or(orParts.join(','))
  }

  const { data, error, count } = await query

  if (error) {
    console.error('listTransactions:', error)
    return fail('Could not load transactions')
  }

  const items = (data ?? []) as unknown as TransactionWithCategory[]
  const total = count ?? null
  const hasMore =
    total !== null
      ? (page + 1) * pageSize < total
      : items.length === pageSize

  return ok({ items, page, pageSize, hasMore, total })
}

/** Last N transactions regardless of filter month (dashboard recent). */
export async function listRecentTransactions(
  limit = 8
): Promise<ActionResult<TransactionWithCategory[]>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const { data, error } = await ctx.supabase
    .from('transactions')
    .select(TRANSACTION_WITH_CATEGORY)
    .eq('user_id', ctx.userId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('listRecentTransactions:', error)
    return fail('Could not load recent transactions')
  }

  return ok((data ?? []) as unknown as TransactionWithCategory[])
}

/**
 * Month income/expense totals.
 * Loads amount+type for the month only (narrow columns). Personal volume is small;
 * promote to SQL RPC if months ever grow huge.
 */
export async function getMonthSummary(
  monthKey: string
): Promise<ActionResult<MonthSummary>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const from = monthStart(monthKey)
  const to = monthEnd(monthKey)

  const { data, error } = await ctx.supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', ctx.userId)
    .gte('transaction_date', from)
    .lte('transaction_date', to)

  if (error) {
    console.error('getMonthSummary:', error)
    return fail('Could not load month summary')
  }

  let income = 0
  let expense = 0
  for (const row of data ?? []) {
    const amt = parseAmount(row.amount as string)
    if (row.type === 'income') income += amt
    else if (row.type === 'expense') expense += amt
  }

  // Round to 2 dp to avoid float noise from summing
  income = Math.round(income * 100) / 100
  expense = Math.round(expense * 100) / 100
  const balance = Math.round((income - expense) * 100) / 100
  const expenseRatio = income > 0 ? expense / income : expense > 0 ? 1 : 0

  return ok({ income, expense, balance, expenseRatio })
}


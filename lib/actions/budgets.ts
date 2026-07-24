'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { getAuthedContext } from '@/lib/actions/auth-context'
import { fail, ok, type ActionResult } from '@/lib/actions/result'
import { currentMonthKey, monthEnd, monthStart } from '@/lib/dates'
import type {
  Budget,
  BudgetMonthSummary,
  BudgetWithActual,
  CategorySummary,
} from '@/lib/types/database'
import {
  createBudgetSchema,
  updateBudgetSchema,
  type CreateBudgetInput,
  type UpdateBudgetInput,
} from '@/lib/validations/budget'

const CATEGORY_SELECT = `
  id,
  name,
  color,
  icon,
  type,
  is_default,
  is_archived
`

const BUDGET_WITH_CATEGORY = `
  *,
  categories ( ${CATEGORY_SELECT} )
`

export type ListBudgetsForMonthResult = {
  budgets: BudgetWithActual[]
  summary: BudgetMonthSummary
}

type BudgetRow = Budget & {
  categories: CategorySummary | CategorySummary[] | null
}

function parseAmount(value: string | number): number {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function toMonthKey(monthKeyOrDate: string): string {
  return monthKeyOrDate.slice(0, 7)
}

/**
 * Mutations only allowed for the current Lagos calendar month.
 * Returns fail message or null if allowed.
 */
function mutationMonthError(monthKeyOrDate: string): string | null {
  const key = toMonthKey(monthKeyOrDate)
  const current = currentMonthKey()
  if (key > current) return 'Cannot set budgets for future months'
  if (key < current) return 'Past months are read-only'
  return null
}

function normalizeCategory(
  categories: BudgetRow['categories']
): CategorySummary | null {
  if (!categories) return null
  if (Array.isArray(categories)) return categories[0] ?? null
  return categories
}

function summarizeBudgets(budgets: BudgetWithActual[]): BudgetMonthSummary {
  let totalBudgeted = 0
  let totalSpent = 0
  for (const b of budgets) {
    totalBudgeted += b.limit
    totalSpent += b.actual
  }
  totalBudgeted = Math.round(totalBudgeted * 100) / 100
  totalSpent = Math.round(totalSpent * 100) / 100
  const remaining = Math.round((totalBudgeted - totalSpent) * 100) / 100
  return { totalBudgeted, totalSpent, remaining }
}

function sortBudgets(budgets: BudgetWithActual[]): BudgetWithActual[] {
  return [...budgets].sort((a, b) => {
    if (b.ratio !== a.ratio) return b.ratio - a.ratio
    const overA = a.actual - a.limit
    const overB = b.actual - b.limit
    if (overB !== overA) return overB - overA
    const nameA = a.categories?.name ?? ''
    const nameB = b.categories?.name ?? ''
    return nameA.localeCompare(nameB)
  })
}

async function loadActualsMap(
  supabase: SupabaseClient,
  userId: string,
  monthKey: string
): Promise<ActionResult<Map<string, number>>> {
  const from = monthStart(monthKey)
  const to = monthEnd(monthKey)

  const { data: txRows, error: txError } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', from)
    .lte('transaction_date', to)

  if (txError) {
    console.error('loadActualsMap:', txError)
    return fail('Could not load budget actuals')
  }

  const map = new Map<string, number>()
  for (const row of txRows ?? []) {
    const catId = row.category_id as string
    const amt = parseAmount(row.amount as string)
    map.set(catId, (map.get(catId) ?? 0) + amt)
  }
  for (const [k, v] of map) {
    map.set(k, Math.round(v * 100) / 100)
  }
  return ok(map)
}

function enrichBudget(
  row: BudgetRow,
  actuals: Map<string, number>
): BudgetWithActual {
  const limit = parseAmount(row.amount)
  const actual = actuals.get(row.category_id) ?? 0
  const ratio = limit > 0 ? actual / limit : 0
  return {
    ...row,
    categories: normalizeCategory(row.categories),
    limit,
    actual,
    ratio,
  }
}

export async function listBudgetsForMonth(
  monthKey: string
): Promise<ActionResult<ListBudgetsForMonthResult>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const key = toMonthKey(monthKey)
  const monthDate = monthStart(key)

  const { data: budgetRows, error } = await ctx.supabase
    .from('budgets')
    .select(BUDGET_WITH_CATEGORY)
    .eq('user_id', ctx.userId)
    .eq('month', monthDate)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('listBudgetsForMonth:', error)
    return fail('Could not load budgets')
  }

  const actualsResult = await loadActualsMap(ctx.supabase, ctx.userId, key)
  if (!actualsResult.ok) return actualsResult

  const budgets = sortBudgets(
    ((budgetRows ?? []) as unknown as BudgetRow[]).map((row) =>
      enrichBudget(row, actualsResult.data)
    )
  )

  return ok({
    budgets,
    summary: summarizeBudgets(budgets),
  })
}

export async function createBudget(
  input: CreateBudgetInput
): Promise<ActionResult<BudgetWithActual>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = createBudgetSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid budget')
  }

  const monthErr = mutationMonthError(parsed.data.month)
  if (monthErr) return fail(monthErr)

  const { data: cat, error: catError } = await ctx.supabase
    .from('categories')
    .select(CATEGORY_SELECT)
    .eq('id', parsed.data.category_id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (catError) {
    console.error('createBudget category:', catError)
    return fail('Could not verify category')
  }
  if (!cat) return fail('Category not found')
  if (cat.type !== 'expense') {
    return fail('Budgets can only be set on expense categories')
  }
  if (cat.is_archived) return fail('Category is archived')

  const { data, error } = await ctx.supabase
    .from('budgets')
    .insert({
      user_id: ctx.userId,
      category_id: parsed.data.category_id,
      period: 'monthly' as const,
      month: parsed.data.month,
      amount: parsed.data.amount,
      is_active: true,
    })
    .select(BUDGET_WITH_CATEGORY)
    .single()

  if (error) {
    console.error('createBudget:', error)
    if (error.code === '23505') {
      return fail('A budget already exists for this category this month')
    }
    return fail('Could not create budget')
  }

  const monthKey = toMonthKey(parsed.data.month)
  const actualsResult = await loadActualsMap(ctx.supabase, ctx.userId, monthKey)
  if (!actualsResult.ok) return actualsResult

  return ok(enrichBudget(data as unknown as BudgetRow, actualsResult.data))
}

export async function updateBudget(
  input: UpdateBudgetInput
): Promise<ActionResult<BudgetWithActual>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = updateBudgetSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid update')
  }

  const { data: existing, error: loadError } = await ctx.supabase
    .from('budgets')
    .select('id, month, category_id, user_id')
    .eq('id', parsed.data.id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('updateBudget load:', loadError)
    return fail('Could not load budget')
  }
  if (!existing) return fail('Budget not found')

  const monthErr = mutationMonthError(existing.month as string)
  if (monthErr) return fail(monthErr)

  const { data, error } = await ctx.supabase
    .from('budgets')
    .update({ amount: parsed.data.amount })
    .eq('id', parsed.data.id)
    .eq('user_id', ctx.userId)
    .select(BUDGET_WITH_CATEGORY)
    .single()

  if (error) {
    console.error('updateBudget:', error)
    return fail('Could not update budget')
  }

  const monthKey = toMonthKey(existing.month as string)
  const actualsResult = await loadActualsMap(ctx.supabase, ctx.userId, monthKey)
  if (!actualsResult.ok) return actualsResult

  return ok(enrichBudget(data as unknown as BudgetRow, actualsResult.data))
}

export async function deleteBudget(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const idParsed = z.string().uuid().safeParse(id)
  if (!idParsed.success) return fail('Invalid budget id')

  const { data: existing, error: loadError } = await ctx.supabase
    .from('budgets')
    .select('id, month')
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('deleteBudget load:', loadError)
    return fail('Could not load budget')
  }
  if (!existing) return fail('Budget not found')

  const monthErr = mutationMonthError(existing.month as string)
  if (monthErr) return fail(monthErr)

  const { error } = await ctx.supabase
    .from('budgets')
    .delete()
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)

  if (error) {
    console.error('deleteBudget:', error)
    return fail('Could not delete budget')
  }

  return ok({ id: idParsed.data })
}

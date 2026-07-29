'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { getAuthedContext } from '@/lib/actions/auth-context'
import { fail, ok, type ActionResult } from '@/lib/actions/result'
import { monthEnd, monthStart, shiftMonthKey } from '@/lib/dates'
import type {
  CategoryBreakdown,
  CategoryMonthComparison,
  CategorySummary,
  DailyTrendPoint,
  MoneyLeak,
  MonthComparison,
  SpendingAnalytics,
  TransactionWithCategory,
} from '@/lib/types/database'

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

function parseAmount(value: string | number): number {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeCategory(
  categories: CategorySummary | CategorySummary[] | null
): CategorySummary | null {
  if (!categories) return null
  if (Array.isArray(categories)) return categories[0] ?? null
  return categories
}

function round2dp(n: number): number {
  return Math.round(n * 100) / 100
}

/** Income / expense totals for a month. */
export async function getMonthIncomeExpense(
  monthKey: string
): Promise<ActionResult<{ income: number; expense: number }>> {
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
    console.error('getMonthIncomeExpense:', error)
    return fail('Could not load month totals')
  }

  let income = 0
  let expense = 0
  for (const row of data ?? []) {
    const amt = parseAmount(row.amount as string)
    if (row.type === 'income') income += amt
    else if (row.type === 'expense') expense += amt
  }

  return ok({ income: round2dp(income), expense: round2dp(expense) })
}

/** Spending grouped by category, sorted by amount desc. */
export async function getCategoryBreakdown(
  monthKey: string
): Promise<ActionResult<CategoryBreakdown[]>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const from = monthStart(monthKey)
  const to = monthEnd(monthKey)

  const { data, error } = await ctx.supabase
    .from('transactions')
    .select(TRANSACTION_WITH_CATEGORY)
    .eq('user_id', ctx.userId)
    .eq('type', 'expense')
    .gte('transaction_date', from)
    .lte('transaction_date', to)
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error('getCategoryBreakdown:', error)
    return fail('Could not load category breakdown')
  }

  const map = new Map<string, CategoryBreakdown>()
  let total = 0

  for (const row of (data ?? []) as unknown as TransactionWithCategory[]) {
    const cat = normalizeCategory(row.categories)
    if (!cat) continue
    const amt = parseAmount(row.amount)
    total += amt
    const existing = map.get(cat.id)
    if (existing) {
      existing.amount = round2dp(existing.amount + amt)
    } else {
      map.set(cat.id, { category: cat, amount: amt, percentOfTotal: 0 })
    }
  }

  const result = Array.from(map.values())
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      amount: round2dp(item.amount),
      percentOfTotal: total > 0 ? round2dp(item.amount / total) : 0,
    }))

  return ok(result)
}

/** Total expenses for a month. */
async function getTotalExpense(
  supabase: SupabaseClient,
  userId: string,
  monthKey: string
): Promise<number> {
  const from = monthStart(monthKey)
  const to = monthEnd(monthKey)

  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', from)
    .lte('transaction_date', to)

  if (error) {
    console.error('getTotalExpense:', error)
    return 0
  }

  return round2dp(
    (data ?? []).reduce((sum, row) => sum + parseAmount(row.amount as string), 0)
  )
}

/** Month-over-month comparison with per-category deltas. */
export async function getMonthComparison(
  monthKey: string
): Promise<ActionResult<MonthComparison | null>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const previousMonthKey = shiftMonthKey(monthKey, -1)

  const [currentTotal, previousTotal] = await Promise.all([
    getTotalExpense(ctx.supabase, ctx.userId, monthKey),
    getTotalExpense(ctx.supabase, ctx.userId, previousMonthKey),
  ])

  // Empty previous month means not enough data for a meaningful comparison
  if (currentTotal === 0 && previousTotal === 0) {
    return ok(null)
  }

  const delta = round2dp(currentTotal - previousTotal)
  const deltaPercent =
    previousTotal > 0 ? round2dp(delta / previousTotal) : currentTotal > 0 ? 1 : 0

  // Per-category comparison
  const [currentBreakdown, previousBreakdown] = await Promise.all([
    getCategoryBreakdown(monthKey),
    getCategoryBreakdown(previousMonthKey),
  ])

  if (!currentBreakdown.ok) return currentBreakdown
  if (!previousBreakdown.ok) return previousBreakdown

  const prevMap = new Map(
    previousBreakdown.data.map((item) => [item.category.id, item.amount])
  )
  const curMap = new Map(
    currentBreakdown.data.map((item) => [item.category.id, item.amount])
  )
  const allCategoryIds = new Set([
    ...prevMap.keys(),
    ...curMap.keys(),
  ])

  const perCategory: CategoryMonthComparison[] = []
  for (const id of allCategoryIds) {
    const currentAmount = curMap.get(id) ?? 0
    const previousAmount = prevMap.get(id) ?? 0
    if (currentAmount === 0 && previousAmount === 0) continue
    const category =
      currentBreakdown.data.find((item) => item.category.id === id)?.category ??
      previousBreakdown.data.find((item) => item.category.id === id)?.category
    if (!category) continue
    perCategory.push({
      category,
      currentAmount,
      previousAmount,
      delta: round2dp(currentAmount - previousAmount),
    })
  }

  perCategory.sort((a, b) => b.currentAmount - a.currentAmount)

  return ok({
    currentMonthKey: monthKey,
    previousMonthKey,
    currentTotal,
    previousTotal,
    delta,
    deltaPercent,
    perCategory,
  })
}

/** Categories that exceeded budget in 2+ of the last 3 months. */
export async function getMoneyLeaks(
  monthKey: string
): Promise<ActionResult<MoneyLeak[]>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const months = [
    shiftMonthKey(monthKey, -2),
    shiftMonthKey(monthKey, -1),
    monthKey,
  ]

  // Load budgets for the last 3 months
  const { data: budgetRows, error: budgetError } = await ctx.supabase
    .from('budgets')
    .select(`*, categories ( ${CATEGORY_SELECT} )`)
    .eq('user_id', ctx.userId)
    .eq('is_active', true)
    .in('month', months.map(monthStart))

  if (budgetError) {
    console.error('getMoneyLeaks budgets:', budgetError)
    return fail('Could not load budgets')
  }

  // Load expense transactions for the last 3 months
  const { data: txRows, error: txError } = await ctx.supabase
    .from('transactions')
    .select(TRANSACTION_WITH_CATEGORY)
    .eq('user_id', ctx.userId)
    .eq('type', 'expense')
    .gte('transaction_date', monthStart(months[0]))
    .lte('transaction_date', monthEnd(months[2]))

  if (txError) {
    console.error('getMoneyLeaks transactions:', txError)
    return fail('Could not load transactions')
  }

  // Build budget map: categoryId -> monthKey -> limit
  const budgetMap = new Map<string, Map<string, number>>()
  const categoryMap = new Map<string, CategorySummary>()

  for (const row of (budgetRows ?? []) as unknown as ({
    month: string
    amount: string
    category_id: string
    categories: CategorySummary | CategorySummary[] | null
  })[]) {
    const cat = normalizeCategory(row.categories)
    if (!cat) continue
    const key = row.month.slice(0, 7)
    if (!budgetMap.has(row.category_id)) {
      budgetMap.set(row.category_id, new Map())
      categoryMap.set(row.category_id, cat)
    }
    budgetMap.get(row.category_id)!.set(key, parseAmount(row.amount))
  }

  // Build actuals map: categoryId -> monthKey -> actual
  const actualMap = new Map<string, Map<string, number>>()
  for (const row of (txRows ?? []) as unknown as TransactionWithCategory[]) {
    const key = row.transaction_date.slice(0, 7)
    if (!actualMap.has(row.category_id)) {
      actualMap.set(row.category_id, new Map())
    }
    const monthMap = actualMap.get(row.category_id)!
    monthMap.set(key, round2dp((monthMap.get(key) ?? 0) + parseAmount(row.amount)))
  }

  const leaks: MoneyLeak[] = []

  for (const [categoryId, monthBudgets] of budgetMap) {
    let monthsOverBudget = 0
    let totalOverspend = 0

    for (const [mKey, limit] of monthBudgets) {
      const actual = actualMap.get(categoryId)?.get(mKey) ?? 0
      if (actual > limit) {
        monthsOverBudget += 1
        totalOverspend += actual - limit
      }
    }

    if (monthsOverBudget >= 2) {
      const category = categoryMap.get(categoryId)
      if (category) {
        leaks.push({
          category,
          monthsOverBudget,
          averageOverspend: round2dp(totalOverspend / monthsOverBudget),
        })
      }
    }
  }

  leaks.sort((a, b) => b.averageOverspend - a.averageOverspend)
  return ok(leaks)
}

/** Daily expense totals for the selected month (all days included). */
export async function getDailyTrend(
  monthKey: string
): Promise<ActionResult<DailyTrendPoint[]>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const from = monthStart(monthKey)
  const to = monthEnd(monthKey)

  const { data, error } = await ctx.supabase
    .from('transactions')
    .select('transaction_date, amount')
    .eq('user_id', ctx.userId)
    .eq('type', 'expense')
    .gte('transaction_date', from)
    .lte('transaction_date', to)

  if (error) {
    console.error('getDailyTrend:', error)
    return fail('Could not load daily trend')
  }

  // Aggregate by date
  const amountByDate = new Map<string, number>()
  for (const row of data ?? []) {
    const date = row.transaction_date as string
    const amt = parseAmount(row.amount as string)
    amountByDate.set(date, round2dp((amountByDate.get(date) ?? 0) + amt))
  }

  // Fill every day of the month
  const start = new Date(from)
  const end = new Date(to)
  const points: DailyTrendPoint[] = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10)
    points.push({
      date: dateStr,
      dayLabel: `${d.getDate()}`,
      amount: amountByDate.get(dateStr) ?? 0,
    })
  }

  return ok(points)
}

/** Aggregate analytics payload for /analytics. */
export async function getSpendingAnalytics(
  monthKey: string
): Promise<ActionResult<SpendingAnalytics>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const [totalsResult, breakdownResult, comparisonResult, leaksResult, trendResult] =
    await Promise.all([
      getMonthIncomeExpense(monthKey),
      getCategoryBreakdown(monthKey),
      getMonthComparison(monthKey),
      getMoneyLeaks(monthKey),
      getDailyTrend(monthKey),
    ])

  if (!totalsResult.ok) return totalsResult
  if (!breakdownResult.ok) return breakdownResult
  if (!comparisonResult.ok) return comparisonResult
  if (!leaksResult.ok) return leaksResult
  if (!trendResult.ok) return trendResult

  const { income, expense } = totalsResult.data
  const balance = round2dp(income - expense)

  return ok({
    monthKey,
    income,
    expense,
    balance,
    categoryBreakdown: breakdownResult.data,
    topCategories: breakdownResult.data.slice(0, 5),
    monthComparison: comparisonResult.data,
    moneyLeaks: leaksResult.data,
    dailyTrend: trendResult.data,
  })
}

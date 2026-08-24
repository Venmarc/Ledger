import { addMonths, differenceInCalendarMonths, format, parseISO } from 'date-fns'

export type MonthlySummaryRow = { month: string; income: number; expense: number; net: number }

type SummaryInput = { type: 'income' | 'expense'; amount: string; transaction_date: string }

function parseAmount(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function round2dp(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Aggregate amounts by calendar month (YYYY-MM). Every month from `from`'s
 * month through `to`'s month inclusive gets a row (zeros when empty).
 */
export function buildMonthlySummary(
  rows: SummaryInput[],
  from: string,
  to: string
): MonthlySummaryRow[] {
  const totals: Record<string, { income: number; expense: number }> = {}

  for (const row of rows) {
    const month = row.transaction_date.slice(0, 7)
    const bucket = (totals[month] ??= { income: 0, expense: 0 })
    const amount = parseAmount(row.amount)

    if (row.type === 'income') bucket.income += amount
    else if (row.type === 'expense') bucket.expense += amount
  }

  const start = parseISO(`${from.slice(0, 7)}-01`)
  const end = parseISO(`${to.slice(0, 7)}-01`)
  const months = differenceInCalendarMonths(end, start)

  const result: MonthlySummaryRow[] = []
  for (let i = 0; i <= months; i++) {
    const month = format(addMonths(start, i), 'yyyy-MM')
    const bucket = totals[month] ?? { income: 0, expense: 0 }
    const income = round2dp(bucket.income)
    const expense = round2dp(bucket.expense)
    result.push({ month, income, expense, net: round2dp(income - expense) })
  }

  return result
}
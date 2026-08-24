import type { NextRequest } from 'next/server'
import { getAuthedContext } from '@/lib/actions/auth-context'
import { buildMonthlySummary } from '@/lib/export/summary'
import {
  csvResponse,
  exportFilename,
  parseExportRange,
  summaryToCsv,
} from '@/lib/export/csv'

export const dynamic = 'force-dynamic'

type SummaryRow = { type: 'income' | 'expense'; amount: string; transaction_date: string }

export async function GET(request: NextRequest) {
  const range = parseExportRange(request.nextUrl.searchParams)
  if (!range.ok) {
    return Response.json({ error: range.error }, { status: 400 })
  }

  const ctx = await getAuthedContext()
  if (!ctx.ok) {
    return Response.json({ error: ctx.error }, { status: 401 })
  }

  const { data, error } = await ctx.supabase
    .from('transactions')
    .select('type, amount, transaction_date')
    .eq('user_id', ctx.userId)
    .gte('transaction_date', range.from)
    .lte('transaction_date', range.to)

  if (error) {
    console.error('export/summary:', error)
    return Response.json({ error: 'Could not export summary' }, { status: 500 })
  }

  const rows = buildMonthlySummary((data ?? []) as unknown as SummaryRow[], range.from, range.to)
  const csv = summaryToCsv(rows)

  return csvResponse(csv, exportFilename('monthly-summary', range.from, range.to))
}
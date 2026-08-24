import type { NextRequest } from 'next/server'
import { getAuthedContext } from '@/lib/actions/auth-context'
import type { TransactionWithCategory } from '@/lib/types/database'
import {
  csvResponse,
  exportFilename,
  parseExportRange,
  transactionsToCsv,
} from '@/lib/export/csv'

export const dynamic = 'force-dynamic'

const TRANSACTION_WITH_CATEGORY = `
  *,
  categories ( id, name, icon, type, is_default, is_archived )
`

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
    .select(TRANSACTION_WITH_CATEGORY)
    .eq('user_id', ctx.userId)
    .gte('transaction_date', range.from)
    .lte('transaction_date', range.to)
    .order('transaction_date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('export/transactions:', error)
    return Response.json({ error: 'Could not export transactions' }, { status: 500 })
  }

  const items = (data ?? []) as unknown as TransactionWithCategory[]
  const csv = transactionsToCsv(items)

  return csvResponse(csv, exportFilename('transactions', range.from, range.to))
}
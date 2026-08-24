import { parseISO } from 'date-fns'
import type { TransactionWithCategory } from '@/lib/types/database'
import type { MonthlySummaryRow } from '@/lib/export/summary'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** RFC 4180: quote a field when it contains `,` `"` CR or LF; double internal quotes. */
export function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Join a matrix of cells into a CSV document: UTF-8 BOM, CRLF row endings, csvEscape per cell. */
export function toCsv(rows: string[][]): string {
  const body = rows.map((cells) => cells.map(csvEscape).join(',')).join('\r\n')
  return `\uFEFF${body}\r\n`
}

/** `ledger-<prefix>-<from>_<to>.csv` with prefix 'transactions' | 'monthly-summary'. */
export function exportFilename(
  prefix: 'transactions' | 'monthly-summary',
  from: string,
  to: string
): string {
  return `ledger-${prefix}-${from}_${to}.csv`
}

/** Validate `from`/`to` search params. Both required, YYYY-MM-DD, valid dates, from <= to. */
export function parseExportRange(
  searchParams: URLSearchParams
): { ok: true; from: string; to: string } | { ok: false; error: string } {
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''

  const valid = (value: string): boolean => {
    if (!DATE_RE.test(value)) return false
    const parsed = parseISO(value)
    return !Number.isNaN(parsed.getTime())
  }

  if (!valid(from) || !valid(to)) {
    return { ok: false, error: 'Invalid date range' }
  }

  if (from > to) {
    return { ok: false, error: 'Invalid date range' }
  }

  return { ok: true, from, to }
}

const TRANSACTION_HEADER = [
  'Date',
  'Type',
  'Amount (₦)',
  'Category',
  'Payment Method',
  'Description',
  'Notes',
  'Tags',
]

function toFixed2(value: string): string {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

/** Transactions CSV document (header + one row per transaction). Sorted order preserved from input. */
export function transactionsToCsv(items: TransactionWithCategory[]): string {
  const rows: string[][] = [TRANSACTION_HEADER]

  for (const tx of items) {
    rows.push([
      tx.transaction_date,
      tx.type,
      toFixed2(tx.amount),
      tx.categories?.name ?? '',
      tx.payment_method ?? '',
      tx.description ?? '',
      tx.notes ?? '',
      (tx.tags ?? []).join(' | '),
    ])
  }

  return toCsv(rows)
}

const SUMMARY_HEADER = ['Month', 'Income (₦)', 'Expense (₦)', 'Net (₦)']

/** Monthly-summary CSV document (header + one row per month). */
export function summaryToCsv(rows: MonthlySummaryRow[]): string {
  const body: string[][] = [SUMMARY_HEADER]

  for (const row of rows) {
    body.push([
      row.month,
      row.income.toFixed(2),
      row.expense.toFixed(2),
      row.net.toFixed(2),
    ])
  }

  return toCsv(body)
}

/** Shared attachment response: text/csv; charset=utf-8, Content-Disposition attachment, no-store. */
export function csvResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
import { isValid, parseISO } from 'date-fns'
import type { Category, PaymentMethod, TransactionType } from '@/lib/types/database'
import type { CreateTransactionInput } from '@/lib/validations/transaction'

export const MAX_IMPORT_ROWS = 500

export interface ParsedCsvRow {
  rowNumber: number
  input: CreateTransactionInput
  categoryName: string
  mappedFromCategory: string | null
}

export interface CsvRowError {
  rowNumber: number
  message: string
}

export interface CsvImportPreview {
  validRows: ParsedCsvRow[]
  errors: CsvRowError[]
  ignoredColumns: string[]
  categoryMappings: Array<{ from: string; to: string; count: number }>
  totalIncome: number
  totalExpense: number
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const SLASH_DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

const HEADER_ALIASES: Record<string, string> = {
  date: 'date',
  transaction_date: 'date',
  'transaction date': 'date',
  type: 'type',
  transaction_type: 'type',
  direction: 'type',
  amount: 'amount',
  'amount (₦)': 'amount',
  'amount (ngn)': 'amount',
  amount_ngn: 'amount',
  category: 'category',
  category_name: 'category',
  'payment method': 'payment_method',
  payment_method: 'payment_method',
  method: 'payment_method',
  description: 'description',
  detail: 'description',
  narration: 'description',
  memo: 'description',
  notes: 'notes',
  note: 'notes',
  tags: 'tags',
  tag: 'tags',
}

const CATEGORY_ALIASES: Record<string, string> = {
  'mobile data & airtime': 'airtime / data',
  'airtime & data': 'airtime / data',
  'airtime/data': 'airtime / data',
  data: 'airtime / data',
  airtime: 'airtime / data',
  'allowance / primary funding': 'salary',
  allowance: 'salary',
  funding: 'salary',
  'family inflow / reimbursement': 'gift',
  reimbursement: 'gift',
  college: 'college / school',
  school: 'college / school',
  education: 'college / school',
  food: 'feeding',
  dining: 'feeding',
  restaurant: 'feeding',
  electricity: 'nepa / electricity',
  nepa: 'nepa / electricity',
  power: 'nepa / electricity',
}

const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Transfer',
  pos: 'POS',
  other: 'Other',
}

/** RFC 4180 CSV parser supporting quoted fields, commas, newlines, and double-quote escapes. */
export function parseCsvMatrix(rawText: string): string[][] {
  const text = rawText.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"'
        i += 1
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\r' && next === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      i += 1
    } else if (ch === '\n' || ch === '\r') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const isoCandidate = trimmed.slice(0, 10)
  if (DATE_RE.test(isoCandidate)) {
    const parsed = parseISO(isoCandidate)
    return isValid(parsed) ? isoCandidate : null
  }

  const slashMatch = trimmed.match(SLASH_DATE_RE)
  if (slashMatch) {
    const first = Number(slashMatch[1])
    const second = Number(slashMatch[2])
    const year = slashMatch[3]
    // Prefer MM/DD/YYYY when first <= 12; otherwise DD/MM/YYYY
    const month = first <= 12 ? first : second
    const day = first <= 12 ? second : first
    const candidate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const parsed = parseISO(candidate)
    return isValid(parsed) ? candidate : null
  }

  return null
}

function normalizeType(raw: string): TransactionType | null {
  const lower = raw.trim().toLowerCase()
  if (lower === 'income' || lower === 'credit' || lower === 'in') return 'income'
  if (lower === 'expense' || lower === 'debit' || lower === 'out') return 'expense'
  return null
}

function normalizeAmount(raw: string): number | null {
  const cleaned = raw.replace(/[₦,\s]/g, '').replace(/^NGN/i, '')
  if (!cleaned) return null
  const num = Number(cleaned)
  if (!Number.isFinite(num) || num <= 0) return null
  return Math.round(num * 100) / 100
}

function normalizePaymentMethod(
  raw: string,
  rawCategory: string,
  description: string
): PaymentMethod | null {
  const trimmed = raw.trim().toLowerCase()
  if (trimmed && PAYMENT_METHOD_MAP[trimmed]) {
    return PAYMENT_METHOD_MAP[trimmed]
  }
  const combined = `${rawCategory} ${description}`.toLowerCase()
  if (combined.includes('pos')) return 'POS'
  if (
    combined.includes('send ') ||
    combined.includes('received from') ||
    combined.includes('transfer') ||
    combined.includes('airtime') ||
    combined.includes('data bundle')
  ) {
    return 'Transfer'
  }
  return null
}

function normalizeTags(raw: string): string[] | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const parts = trimmed.includes('|') ? trimmed.split('|') : trimmed.split(',')
  const cleaned = parts
    .map((t) => t.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 20)
  return cleaned.length > 0 ? cleaned : null
}

function resolveCategory(
  rawCategory: string,
  txType: TransactionType,
  categories: Category[]
): { category: Category; mappedFrom: string | null } | null {
  const byType = categories.filter((c) => c.type === txType && !c.is_archived)
  if (byType.length === 0) return null

  const clean = rawCategory.trim()
  const lower = clean.toLowerCase()

  // 1. Direct case-insensitive match
  const exact = byType.find((c) => c.name.trim().toLowerCase() === lower)
  if (exact) {
    return { category: exact, mappedFrom: null }
  }

  // 2. Known alias match
  const aliasTarget = CATEGORY_ALIASES[lower]
  if (aliasTarget) {
    const aliased = byType.find((c) => c.name.trim().toLowerCase() === aliasTarget)
    if (aliased) {
      return {
        category: aliased,
        mappedFrom: clean && clean.toLowerCase() !== aliased.name.toLowerCase() ? clean : null,
      }
    }
  }

  // 3. Fallback to Misc (expense) or Gift (income), or first active category of type
  const fallbackName = txType === 'expense' ? 'misc' : 'gift'
  const fallback =
    byType.find((c) => c.name.trim().toLowerCase() === fallbackName) ?? byType[0]

  return {
    category: fallback,
    mappedFrom: clean ? clean : '(blank)',
  }
}

/**
 * Parse CSV text into validated Ledger transaction payloads.
 * Extra columns not used by Ledger (e.g. transaction_id, time, signed_amount) are ignored.
 */
export function parseTransactionsCsv(
  rawText: string,
  categories: Category[]
): CsvImportPreview {
  const matrix = parseCsvMatrix(rawText)
  if (matrix.length < 2) {
    return {
      validRows: [],
      errors: [{ rowNumber: 1, message: 'CSV must include a header row and at least one data row.' }],
      ignoredColumns: [],
      categoryMappings: [],
      totalIncome: 0,
      totalExpense: 0,
    }
  }

  const rawHeaders = matrix[0]
  const colIndex: Record<string, number> = {}
  const ignoredColumns: string[] = []

  rawHeaders.forEach((header, idx) => {
    const key = HEADER_ALIASES[header.trim().toLowerCase()]
    if (key && colIndex[key] === undefined) {
      colIndex[key] = idx
    } else if (header.trim()) {
      ignoredColumns.push(header.trim())
    }
  })

  if (colIndex.date === undefined || colIndex.type === undefined || colIndex.amount === undefined) {
    return {
      validRows: [],
      errors: [
        {
          rowNumber: 1,
          message: 'Missing required columns. Expected at least: Date, Type, and Amount.',
        },
      ],
      ignoredColumns,
      categoryMappings: [],
      totalIncome: 0,
      totalExpense: 0,
    }
  }

  const dataRows = matrix.slice(1)
  if (dataRows.length > MAX_IMPORT_ROWS) {
    return {
      validRows: [],
      errors: [
        {
          rowNumber: 1,
          message: `Too many rows (${dataRows.length}). Maximum ${MAX_IMPORT_ROWS} transactions per import.`,
        },
      ],
      ignoredColumns,
      categoryMappings: [],
      totalIncome: 0,
      totalExpense: 0,
    }
  }

  const validRows: ParsedCsvRow[] = []
  const errors: CsvRowError[] = []
  const mappingCounts = new Map<string, { from: string; to: string; count: number }>()
  let totalIncome = 0
  let totalExpense = 0

  dataRows.forEach((cells, idx) => {
    const rowNumber = idx + 2
    const getCell = (field: string): string => {
      const i = colIndex[field]
      return i !== undefined && i < cells.length ? cells[i] : ''
    }

    const txDate = normalizeDate(getCell('date'))
    if (!txDate) {
      errors.push({ rowNumber, message: `Invalid date "${getCell('date').trim()}"` })
      return
    }

    const txType = normalizeType(getCell('type'))
    if (!txType) {
      errors.push({ rowNumber, message: `Invalid type "${getCell('type').trim()}" (use income or expense)` })
      return
    }

    const amount = normalizeAmount(getCell('amount'))
    if (amount === null) {
      errors.push({ rowNumber, message: `Invalid amount "${getCell('amount').trim()}"` })
      return
    }

    const rawCategory = getCell('category')
    const resolved = resolveCategory(rawCategory, txType, categories)
    if (!resolved) {
      errors.push({ rowNumber, message: `No ${txType} categories available in your account` })
      return
    }

    const descriptionRaw = getCell('description').trim()
    const description = descriptionRaw ? descriptionRaw.slice(0, 500) : null

    const notesRaw = getCell('notes').trim()
    const notes = notesRaw ? notesRaw.slice(0, 2000) : null

    const paymentMethod = normalizePaymentMethod(
      getCell('payment_method'),
      rawCategory,
      descriptionRaw
    )
    const tags = normalizeTags(getCell('tags'))

    if (resolved.mappedFrom) {
      const mapKey = `${resolved.mappedFrom}->${resolved.category.name}`
      const existing = mappingCounts.get(mapKey)
      if (existing) {
        existing.count += 1
      } else {
        mappingCounts.set(mapKey, {
          from: resolved.mappedFrom,
          to: resolved.category.name,
          count: 1,
        })
      }
    }

    if (txType === 'income') {
      totalIncome = Math.round((totalIncome + amount) * 100) / 100
    } else {
      totalExpense = Math.round((totalExpense + amount) * 100) / 100
    }

    validRows.push({
      rowNumber,
      categoryName: resolved.category.name,
      mappedFromCategory: resolved.mappedFrom,
      input: {
        amount,
        type: txType,
        category_id: resolved.category.id,
        transaction_date: txDate,
        description,
        notes,
        payment_method: paymentMethod,
        tags,
      },
    })
  })

  return {
    validRows,
    errors,
    ignoredColumns,
    categoryMappings: Array.from(mappingCounts.values()),
    totalIncome,
    totalExpense,
  }
}

'use client'

import { useState } from 'react'
import { AlertCircle, Download, Loader2 } from 'lucide-react'
import { format, parseISO, subMonths } from 'date-fns'
import { SectionShell } from '@/components/analytics/section-shell'
import { DateField } from '@/components/transactions/date-field'
import { todayInLagos } from '@/lib/dates'
import { cn } from '@/lib/utils'

/** First day of the month 11 months before the current Lagos month. */
function defaultFrom(): string {
  const now = todayInLagos()
  const firstOfMonth = `${now.slice(0, 7)}-01`
  return format(subMonths(parseISO(firstOfMonth), 11), 'yyyy-MM-dd')
}

type BusyKey = 'transactions' | 'summary' | null

export function ExportSection() {
  const [txFrom, setTxFrom] = useState(defaultFrom)
  const [txTo, setTxTo] = useState(todayInLagos())
  const [sumFrom, setSumFrom] = useState(defaultFrom)
  const [sumTo, setSumTo] = useState(todayInLagos())
  const [busy, setBusy] = useState<BusyKey>(null)
  const [error, setError] = useState(false)

  const txValid = txFrom !== '' && txTo !== '' && txFrom <= txTo
  const sumValid = sumFrom !== '' && sumTo !== '' && sumFrom <= sumTo

  async function downloadCsv(url: string, key: Exclude<BusyKey, null>): Promise<void> {
    setBusy(key)
    setError(false)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Export failed: ${res.status}`)

      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="([^"]+)"/)
      const filename = match?.[1] ?? 'ledger-export.csv'

      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setError(true)
    } finally {
      setBusy(null)
    }
  }

  const buttonClass = cn(
    'pressable inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-5 text-sm font-semibold text-text-primary',
    'transition-colors hover:border-border-strong hover:bg-bg-subtle',
    'disabled:pointer-events-none disabled:opacity-40',
    'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure'
  )

  return (
    <SectionShell title="Export Data" ariaLabel="Export data">
      <p className="-mt-2 mb-4 text-sm text-text-secondary">
        Download your transactions or a monthly income and expense summary as a
        CSV file.
      </p>

      <div className="space-y-4">
        <div className="rounded-xl bg-bg-subtle p-4">
          <h3 className="font-medium text-text-primary">Transactions</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Every transaction between the selected dates.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DateField
              id="export-tx-from"
              label="From"
              value={txFrom}
              onChange={setTxFrom}
            />
            <DateField id="export-tx-to" label="To" value={txTo} onChange={setTxTo} />
          </div>

          <button
            type="button"
            className={cn(buttonClass, 'mt-4')}
            onClick={() =>
              void downloadCsv(
                `/api/export/transactions?from=${txFrom}&to=${txTo}`,
                'transactions'
              )
            }
            disabled={!txValid || busy !== null}
          >
            {busy === 'transactions' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Exporting…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden />
                Download CSV
              </>
            )}
          </button>
        </div>

        <div className="rounded-xl bg-bg-subtle p-4">
          <h3 className="font-medium text-text-primary">Monthly Summary</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Income, expense, and net totals per month.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DateField
              id="export-summary-from"
              label="From"
              value={sumFrom}
              onChange={setSumFrom}
            />
            <DateField
              id="export-summary-to"
              label="To"
              value={sumTo}
              onChange={setSumTo}
            />
          </div>

          <button
            type="button"
            className={cn(buttonClass, 'mt-4')}
            onClick={() =>
              void downloadCsv(
                `/api/export/summary?from=${sumFrom}&to=${sumTo}`,
                'summary'
              )
            }
            disabled={!sumValid || busy !== null}
          >
            {busy === 'summary' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Exporting…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden />
                Download CSV
              </>
            )}
          </button>
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-red/40 bg-red-muted px-4 py-3 text-sm text-red"
          >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            Could not export. Check your connection and try again.
          </div>
        ) : null}
      </div>
    </SectionShell>
  )
}
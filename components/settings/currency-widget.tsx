'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { SectionShell } from '@/components/analytics/section-shell'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Rates = {
  USD: number
  GBP: number
  EUR: number
  lastUpdated: string
}

const OUTPUT_CURRENCIES: { code: keyof Omit<Rates, 'lastUpdated'>; locale: string }[] = [
  { code: 'USD', locale: 'en-US' },
  { code: 'GBP', locale: 'en-GB' },
  { code: 'EUR', locale: 'en-IE' },
]

function formatForeign(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatLastUpdated(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function CurrencyWidget() {
  const [rates, setRates] = useState<Rates | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    let cancelled = false

    fetch('/api/rates')
      .then((res) => {
        if (!res.ok) throw new Error('Rates unavailable')
        return res.json()
      })
      .then((data: Rates) => {
        if (cancelled) return
        setRates(data)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const numericAmount = parseFloat(amount)
  const validAmount = Number.isFinite(numericAmount) ? numericAmount : 0

  return (
    <SectionShell title="Currency Reference" ariaLabel="Currency reference">
      <p className="-mt-2 mb-4 text-sm text-text-secondary">
        Not tied to your transactions. For reference only.
      </p>

      {status === 'error' ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red/40 bg-red-muted px-4 py-6 text-center">
          <AlertCircle className="h-8 w-8 text-red" aria-hidden />
          <p className="mt-2 text-sm text-red">
            Rates unavailable. Check your connection.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="currency-widget-amount"
              className="text-xs font-medium text-text-tertiary"
            >
              Amount (₦)
            </label>
            <input
              id="currency-widget-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={status === 'loading'}
              className={cn(
                'mt-1 min-h-11 w-full rounded-lg border border-border bg-bg-elevated px-3 text-base tabular-nums text-text-primary',
                'focus:border-azure focus:outline-none focus:ring-1 focus:ring-azure',
                'disabled:opacity-60'
              )}
            />
          </div>

          <div className="space-y-2">
            {OUTPUT_CURRENCIES.map(({ code, locale }) => (
              <div
                key={code}
                className="flex items-center justify-between rounded-lg bg-bg-subtle px-3 py-2"
              >
                <span className="text-sm font-medium text-text-tertiary">
                  {code}
                </span>
                {status === 'loading' || !rates ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <span className="text-base font-semibold tabular-nums text-text-primary">
                    {formatForeign(validAmount * rates[code], code, locale)}
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-text-tertiary">
            Rates from exchangerate-api.com.{' '}
            {rates ? `Last updated ${formatLastUpdated(rates.lastUpdated)}.` : ''}
          </p>
        </div>
      )}
    </SectionShell>
  )
}

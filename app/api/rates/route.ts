import { NextResponse } from 'next/server'

type RatesResponse = {
  USD: number
  GBP: number
  EUR: number
  lastUpdated: string
}

export async function GET() {
  const apiKey = process.env.CURRENCY_API_KEY
  const baseUrl = process.env.CURRENCY_API_BASE_URL

  if (!apiKey || !baseUrl) {
    console.error('rates route: missing CURRENCY_API_KEY or CURRENCY_API_BASE_URL')
    return NextResponse.json({ error: 'Rates unavailable' }, { status: 500 })
  }

  try {
    const upstream = await fetch(`${baseUrl}/${apiKey}/latest/NGN`)

    if (!upstream.ok) {
      console.error('rates route: upstream error', upstream.status)
      return NextResponse.json({ error: 'Rates unavailable' }, { status: 502 })
    }

    const data = await upstream.json()
    const rates = data?.conversion_rates

    if (
      !rates ||
      typeof rates.USD !== 'number' ||
      typeof rates.GBP !== 'number' ||
      typeof rates.EUR !== 'number'
    ) {
      console.error('rates route: malformed upstream response')
      return NextResponse.json({ error: 'Rates unavailable' }, { status: 502 })
    }

    const result: RatesResponse = {
      USD: rates.USD,
      GBP: rates.GBP,
      EUR: rates.EUR,
      lastUpdated:
        typeof data.time_last_update_utc === 'string'
          ? data.time_last_update_utc
          : new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('rates route: fetch failed', error)
    return NextResponse.json({ error: 'Rates unavailable' }, { status: 502 })
  }
}

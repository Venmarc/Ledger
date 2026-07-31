import { formatNGN } from '@/lib/utils'

type ChartTooltipPayloadItem = {
  value?: unknown
  name?: unknown
  payload?: { name?: unknown }
}

type ChartTooltipProps = {
  active?: boolean
  // Recharts' TooltipPayload is a readonly array with a broader item shape —
  // this must stay readonly/structurally loose so `content={(props) => ...}`
  // is assignable regardless of chart type (Bar vs Area payload shapes differ).
  payload?: readonly ChartTooltipPayloadItem[]
  label?: unknown
}

/** Recharts payload `value` can be number | string | an array pair depending on chart type. */
function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value) || 0
  if (Array.isArray(value)) return toNumber(value[0])
  return 0
}

function toLabel(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-md border border-border-strong bg-bg-elevated px-3 py-2 shadow-elevated">
      {label !== undefined ? (
        <p className="text-xs font-medium text-text-secondary">{toLabel(label)}</p>
      ) : null}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-text-primary">
          {toLabel(entry.name ?? entry.payload?.name)}:{' '}
          <span className="tabular-nums">{formatNGN(toNumber(entry.value))}</span>
        </p>
      ))}
    </div>
  )
}

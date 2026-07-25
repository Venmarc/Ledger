'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  currentMonthKey,
  formatMonthLabel,
  shiftMonthKey,
} from '@/lib/dates'
import { cn } from '@/lib/utils'
import { SnapSlider, type SnapSliderItem } from '@/components/ui/snap-slider'

type Props = {
  monthKey: string
  onChange: (monthKey: string) => void
  className?: string
}

/** Product earliest year — year slider lower bound. */
const MIN_YEAR = 2025

/** Primary slider track (between chevrons) — both year & month use this width.
 *  w-20 (5rem/80px) on mobile, w-24 (6rem/96px) ≥ sm: tight enough that the
 *  SnapSlider 12% mask fade fully covers neighbour glyphs (no "n"/"A" bleed). */
const TRACK_W = 'w-20 min-w-20 sm:w-24 sm:min-w-24'
/** Full pill width: chevron 2.5rem × 2 + track + padding — dropped month matches this. */
const PILL_W =
  'w-[calc(2.5rem+5rem+2.5rem+0.25rem)] sm:w-[calc(2.5rem+6rem+2.5rem+0.25rem)]'

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m }
}

function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * Dual snap-slider month control (no calendar dialog).
 * - Default: month slider in the pill (peek neighbors + physics).
 * - Tap center: month drops down **at the same pill width** (still a slider),
 *   year slider eases into the primary slot.
 * - Tap year / month / outside: year eases out, month returns.
 * Desktop chevrons still step one month.
 */
export function MonthSelector({ monthKey, onChange, className }: Props) {
  const current = currentMonthKey()
  const { year: curYear, month: curMonth } = parseMonthKey(current)
  const { year: selectedYear, month: selectedMonth } = parseMonthKey(monthKey)

  const [yearOpen, setYearOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const maxYear = Math.max(curYear, MIN_YEAR)
  const minYear = MIN_YEAR

  const yearItems = React.useMemo<SnapSliderItem<number>[]>(() => {
    const list: SnapSliderItem<number>[] = []
    for (let y = minYear; y <= maxYear; y++) {
      list.push({ value: y, label: String(y) })
    }
    return list
  }, [minYear, maxYear])

  const monthItems = React.useMemo<SnapSliderItem<number>[]>(() => {
    return MONTH_SHORT.map((label, i) => {
      const month = i + 1
      const key = toMonthKey(selectedYear, month)
      const disabled = key > current
      return { value: month, label, disabled }
    })
  }, [selectedYear, current])

  const canGoPrev = monthKey > toMonthKey(minYear, 1)
  const canGoNext = monthKey < current

  const setYear = (year: number) => {
    let month = selectedMonth
    let key = toMonthKey(year, month)
    if (key > current) {
      if (year === curYear) {
        month = curMonth
        key = toMonthKey(year, month)
      } else if (year > curYear) {
        return
      }
    }
    if (key < toMonthKey(minYear, 1)) return
    onChange(key)
  }

  const setMonth = (month: number) => {
    const key = toMonthKey(selectedYear, month)
    if (key > current) return
    if (key < toMonthKey(minYear, 1)) return
    onChange(key)
  }

  const collapse = React.useCallback(() => setYearOpen(false), [])
  const toggleYear = React.useCallback(() => {
    setYearOpen((v) => !v)
  }, [])

  React.useEffect(() => {
    if (!yearOpen) return
    const onPointer = (e: PointerEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        collapse()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') collapse()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [yearOpen, collapse])

  const step = (delta: number) => {
    const next = shiftMonthKey(monthKey, delta)
    if (next > current) return
    if (next < toMonthKey(minYear, 1)) return
    onChange(next)
  }

  return (
    // w-fit: never stretch across the header. Dropped month is absolute (overlay).
    <div
      ref={rootRef}
      className={cn('relative z-20 inline-flex w-fit max-w-full flex-col items-start', className)}
    >
      <div
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full border border-border bg-bg-surface p-0.5 shadow-card',
          'transition-[box-shadow,transform] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]'
        )}
      >
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={!canGoPrev}
          className={cn(
            'pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full cursor-pointer',
            canGoPrev
              ? 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
              : 'cursor-not-allowed text-text-tertiary opacity-40'
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Primary track: year when expanded, month when collapsed — fixed width */}
        <div className={cn('relative overflow-hidden', TRACK_W)}>
          <div
            className={cn(
              'transition-[opacity,transform,filter] duration-[var(--duration-slow)] [transition-timing-function:var(--ease-smooth)]',
              yearOpen
                ? 'pointer-events-none absolute inset-0 translate-y-2 opacity-0 blur-[2px]'
                : 'relative opacity-100 translate-y-0 blur-0'
            )}
            aria-hidden={yearOpen}
          >
            <SnapSlider
              items={monthItems}
              value={selectedMonth}
              onChange={setMonth}
              onActiveClick={toggleYear}
              itemWidth={72}
              height={40}
              size="md"
              ariaLabel={`Month ${formatMonthLabel(monthKey)}. Swipe to change, tap to choose year.`}
            />
          </div>

          <div
            className={cn(
              'transition-[opacity,transform,filter] duration-[var(--duration-slow)] [transition-timing-function:var(--ease-smooth)]',
              yearOpen
                ? 'relative opacity-100 translate-y-0 blur-0'
                : 'pointer-events-none absolute inset-0 -translate-y-1.5 opacity-0 blur-[2px]'
            )}
            aria-hidden={!yearOpen}
          >
            <SnapSlider
              items={yearItems}
              value={Math.min(maxYear, Math.max(minYear, selectedYear))}
              onChange={setYear}
              onActiveClick={collapse}
              itemWidth={72}
              height={40}
              size="md"
              ariaLabel={`Year ${selectedYear}. Swipe to change, tap to close.`}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={!canGoNext}
          className={cn(
            'pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full cursor-pointer',
            canGoNext
              ? 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
              : 'cursor-not-allowed text-text-tertiary opacity-40'
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/*
        Dropped month: overlays content below (absolute) — does not push layout.
        Outer div: static centering only (left-1/2 + inline translateX so it
        never conflicts with the animated translateY on the inner div).
        Inner div: animated translateY + opacity + visibility — no blur to avoid
        GPU filter stutter.
      */}
      <div
        className={cn('absolute left-1/2 top-full z-30 mt-1.5', PILL_W)}
        style={{ transform: 'translateX(-50%)' }}
      >
        <div
          className={cn(
            'transition-[opacity,transform,visibility] duration-[var(--duration-slow)] [transition-timing-function:var(--ease-smooth)]',
            yearOpen
              ? 'pointer-events-auto visible translate-y-0 opacity-100'
              : 'pointer-events-none invisible -translate-y-1 opacity-0'
          )}
          aria-hidden={!yearOpen}
        >
          <div className="overflow-hidden rounded-full border border-border bg-bg-surface p-0.5 shadow-elevated">
            <SnapSlider
              items={monthItems}
              value={selectedMonth}
              onChange={setMonth}
              onActiveClick={collapse}
              itemWidth={72}
              height={40}
              size="md"
              ariaLabel={`Month ${MONTH_SHORT[selectedMonth - 1]}. Swipe to change, tap to collapse.`}
            />
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {formatMonthLabel(monthKey)}
        {yearOpen ? '. Year picker open.' : ''}
      </p>
    </div>
  )
}

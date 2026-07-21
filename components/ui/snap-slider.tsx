'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { prefersReducedMotion } from '@/lib/motion'

export type SnapSliderItem<T extends string | number = string> = {
  value: T
  label: string
  disabled?: boolean
}

type SnapSliderProps<T extends string | number> = {
  items: SnapSliderItem<T>[]
  value: T
  onChange: (value: T) => void
  /** Fired when the active (center) label is tapped — expand/collapse, etc. */
  onActiveClick?: () => void
  className?: string
  /** Track height */
  height?: number
  /** Width of each snap cell in px */
  itemWidth?: number
  ariaLabel?: string
  /** Visual density of the center label */
  size?: 'sm' | 'md'
}

/**
 * Horizontal discrete slider with real physics (Rule 3) + magnetic snap (Rule 4).
 * Edge mask peeks previous/next items so the track reads as continuous.
 */
export function SnapSlider<T extends string | number>({
  items,
  value,
  onChange,
  onActiveClick,
  className,
  height = 40,
  itemWidth = 88,
  ariaLabel,
  size = 'md',
}: SnapSliderProps<T>) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const rafRef = React.useRef<number | null>(null)
  const offsetRef = React.useRef(0)
  const velocityRef = React.useRef(0)
  const draggingRef = React.useRef(false)
  const pointerIdRef = React.useRef<number | null>(null)
  const lastXRef = React.useRef(0)
  const lastTRef = React.useRef(0)
  const snappedRef = React.useRef(true)
  const valueRef = React.useRef(value)
  const itemsRef = React.useRef(items)
  const onChangeRef = React.useRef(onChange)

  const [offset, setOffset] = React.useState(0)
  const [pulseKey, setPulseKey] = React.useState(0)
  const [trackWidth, setTrackWidth] = React.useState(0)

  React.useEffect(() => {
    valueRef.current = value
    itemsRef.current = items
    onChangeRef.current = onChange
  }, [value, items, onChange])

  const indexOf = React.useCallback((v: T, list: SnapSliderItem<T>[]) => {
    const i = list.findIndex((it) => it.value === v)
    return i < 0 ? 0 : i
  }, [])

  const targetOffsetForIndex = React.useCallback(
    (index: number) => -index * itemWidth,
    [itemWidth]
  )

  const clampIndex = React.useCallback(
    (i: number, list: SnapSliderItem<T>[]) =>
      Math.max(0, Math.min(list.length - 1, i)),
    []
  )

  const nearestEnabledIndex = React.useCallback(
    (
      rawIndex: number,
      list: SnapSliderItem<T>[],
      prefer: 'nearest' | 'left' | 'right' = 'nearest'
    ) => {
      if (list.length === 0) return 0
      const i = clampIndex(Math.round(rawIndex), list)
      if (!list[i]?.disabled) return i

      for (let d = 1; d < list.length; d++) {
        const L = i - d
        const R = i + d
        if (prefer === 'right') {
          if (R < list.length && !list[R]?.disabled) return R
          if (L >= 0 && !list[L]?.disabled) return L
        } else if (prefer === 'left') {
          if (L >= 0 && !list[L]?.disabled) return L
          if (R < list.length && !list[R]?.disabled) return R
        } else {
          if (L >= 0 && !list[L]?.disabled) return L
          if (R < list.length && !list[R]?.disabled) return R
        }
      }
      return clampIndex(i, list)
    },
    [clampIndex]
  )

  // Sync offset when controlled value / items / track width change (not while dragging).
  // Re-run on trackWidth so the first layout after measure centers the selected item
  // (avoids a flash of Jan/Feb before Jul snaps into place).
  React.useEffect(() => {
    if (draggingRef.current) return
    const i = nearestEnabledIndex(indexOf(value, items), items)
    const next = targetOffsetForIndex(i)
    offsetRef.current = next
    setOffset(next)
  }, [value, items, trackWidth, indexOf, nearestEnabledIndex, targetOffsetForIndex])

  React.useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setTrackWidth(el.clientWidth)
    })
    ro.observe(el)
    setTrackWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const stopRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const commitIndex = React.useCallback(
    (index: number, pulse: boolean) => {
      const list = itemsRef.current
      const safe = nearestEnabledIndex(index, list)
      const item = list[safe]
      if (!item || item.disabled) return
      const nextOff = targetOffsetForIndex(safe)
      offsetRef.current = nextOff
      setOffset(nextOff)
      snappedRef.current = true
      if (item.value !== valueRef.current) {
        onChangeRef.current(item.value)
      }
      if (pulse) setPulseKey((k) => k + 1)
    },
    [nearestEnabledIndex, targetOffsetForIndex]
  )

  const rubber = React.useCallback(
    (raw: number, list: SnapSliderItem<T>[]) => {
      const min = targetOffsetForIndex(list.length - 1)
      const max = 0
      if (raw > max) return max + (raw - max) * 0.32
      if (raw < min) return min + (raw - min) * 0.32
      return raw
    },
    [targetOffsetForIndex]
  )

  const animateToIndex = React.useCallback(
    (index: number) => {
      stopRaf()
      const list = itemsRef.current
      const safe = nearestEnabledIndex(index, list)
      const target = targetOffsetForIndex(safe)
      const reduced = prefersReducedMotion()

      if (reduced) {
        commitIndex(safe, true)
        return
      }

      const start = offsetRef.current
      const dist = target - start
      if (Math.abs(dist) < 0.5) {
        commitIndex(safe, true)
        return
      }

      const duration = Math.min(420, Math.max(180, Math.abs(dist) * 1.1))
      const t0 = performance.now()

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration)
        // --ease-smooth approximation
        const eased = 1 - Math.pow(1 - t, 3.2)
        const o = start + dist * eased
        offsetRef.current = o
        setOffset(o)
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          commitIndex(safe, true)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [commitIndex, nearestEnabledIndex, targetOffsetForIndex]
  )

  const coast = React.useCallback(() => {
    stopRaf()
    const list = itemsRef.current
    if (list.length === 0) return

    if (prefersReducedMotion()) {
      const idx = nearestEnabledIndex(-offsetRef.current / itemWidth, list)
      animateToIndex(idx)
      return
    }

    const FRICTION = 0.935
    const MIN_V = 0.04

    const step = () => {
      if (draggingRef.current) return

      let v = velocityRef.current
      let o = offsetRef.current + v * 16
      o = rubber(o, list)
      offsetRef.current = o
      setOffset(o)

      // Soft magnetic pull when slow near a snap (Rule 4)
      const rawIndex = -o / itemWidth
      const nearest = Math.round(rawIndex)
      const snapOff = targetOffsetForIndex(
        nearestEnabledIndex(nearest, list)
      )
      const delta = snapOff - o
      const pullZone = itemWidth * 0.28
      const releaseZone = itemWidth * 0.55
      const zone = snappedRef.current ? releaseZone : pullZone

      if (Math.abs(v) < 0.55 && Math.abs(delta) < zone) {
        snappedRef.current = true
        v += delta * 0.14
      } else if (Math.abs(delta) > releaseZone) {
        snappedRef.current = false
      }

      v *= FRICTION
      velocityRef.current = v

      const min = targetOffsetForIndex(list.length - 1)
      const max = 0
      const pastEdge = o > max + 2 || o < min - 2

      if (Math.abs(v) < MIN_V || pastEdge) {
        const idx = nearestEnabledIndex(-offsetRef.current / itemWidth, list)
        animateToIndex(idx)
        return
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
  }, [animateToIndex, itemWidth, nearestEnabledIndex, rubber, targetOffsetForIndex])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    stopRaf()
    draggingRef.current = true
    pointerIdRef.current = e.pointerId
    lastXRef.current = e.clientX
    lastTRef.current = performance.now()
    velocityRef.current = 0
    trackRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || pointerIdRef.current !== e.pointerId) return
    const now = performance.now()
    const dx = e.clientX - lastXRef.current
    const dt = Math.max(8, now - lastTRef.current)
    const list = itemsRef.current

    const next = rubber(offsetRef.current + dx, list)
    offsetRef.current = next
    setOffset(next)

    // EMA velocity (px/ms * 16 ≈ px/frame)
    const inst = (dx / dt) * 16
    velocityRef.current = velocityRef.current * 0.7 + inst * 0.3
    lastXRef.current = e.clientX
    lastTRef.current = now
    snappedRef.current = false
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!draggingRef.current || pointerIdRef.current !== e.pointerId) return
    draggingRef.current = false
    pointerIdRef.current = null
    try {
      trackRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }

    const moved = Math.abs(velocityRef.current) > 0.15
    if (!moved && Math.abs(e.clientX - lastXRef.current) < 2) {
      // Treat as click on center → active click when little motion
      const list = itemsRef.current
      const idx = nearestEnabledIndex(-offsetRef.current / itemWidth, list)
      const centerX = (trackWidth || 0) / 2
      const localX = e.clientX - (trackRef.current?.getBoundingClientRect().left ?? 0)
      if (Math.abs(localX - centerX) < itemWidth * 0.55 && onActiveClick) {
        onActiveClick()
        animateToIndex(idx)
        return
      }
      // Click off-center item: jump to it
      const contentX = -offsetRef.current + (localX - centerX)
      const clicked = Math.round(contentX / itemWidth)
      animateToIndex(clicked)
      return
    }

    // Project a bit with velocity for flick weight
    const projected =
      -offsetRef.current / itemWidth - (velocityRef.current * 8) / itemWidth
    if (Math.abs(velocityRef.current) > 0.8) {
      const idx = nearestEnabledIndex(
        projected,
        itemsRef.current,
        velocityRef.current < 0 ? 'right' : 'left'
      )
      animateToIndex(idx)
    } else {
      coast()
    }
  }

  React.useEffect(() => () => stopRaf(), [])

  const centerPad = Math.max(0, (trackWidth - itemWidth) / 2)
  const activeIndex = indexOf(value, items)

  const onKeyDown = (e: React.KeyboardEvent) => {
    const list = items
    const cur = indexOf(value, list)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = nearestEnabledIndex(cur - 1, list, 'left')
      if (next !== cur) {
        onChange(list[next]!.value)
        setPulseKey((k) => k + 1)
      }
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = nearestEnabledIndex(cur + 1, list, 'right')
      if (next !== cur) {
        onChange(list[next]!.value)
        setPulseKey((k) => k + 1)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActiveClick?.()
    } else if (e.key === 'Home') {
      e.preventDefault()
      const next = nearestEnabledIndex(0, list, 'right')
      onChange(list[next]!.value)
    } else if (e.key === 'End') {
      e.preventDefault()
      const next = nearestEnabledIndex(list.length - 1, list, 'left')
      onChange(list[next]!.value)
    }
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={Math.max(0, items.length - 1)}
      aria-valuenow={activeIndex}
      aria-valuetext={items[activeIndex]?.label}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        'snap-slider-mask relative touch-none select-none outline-none',
        'cursor-grab active:cursor-grabbing',
        'focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface',
        className
      )}
      style={{ height }}
    >
      <div
        className="flex h-full items-center will-change-transform"
        style={{
          transform: `translate3d(${centerPad + offset}px, 0, 0)`,
          width: items.length * itemWidth,
        }}
      >
        {items.map((item) => {
          const active = item.value === value
          return (
            <div
              key={String(item.value)}
              className="flex shrink-0 items-center justify-center"
              style={{ width: itemWidth, height }}
            >
              <span
                className={cn(
                  'max-w-full truncate px-1 text-center tabular-nums transition-[color,opacity,transform] duration-[var(--duration-fast)]',
                  size === 'sm' ? 'text-xs font-semibold' : 'text-sm font-semibold',
                  active
                    ? 'text-text-primary'
                    : item.disabled
                      ? 'text-text-tertiary/40'
                      : 'text-text-tertiary',
                  active && pulseKey > 0 ? 'snap-label-pulse' : null
                )}
                aria-hidden
              >
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

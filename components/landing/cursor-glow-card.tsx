'use client'

import React, { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Rest position: bottom-center of the card (glossary option — not a separate effect). */
const REST_X = 50
const REST_Y = 78

interface CursorGlowCardProps {
  className?: string
  children?: React.ReactNode
  /** Accessible name when the card is decorative/empty */
  'aria-label'?: string
}

/**
 * [Depth] Warm glow on a card that sticks to the cursor (fin.com)
 * + Rest Position option: eases back to starting spot on leave.
 * Azure, soft, noticeability over decoration. Hidden on coarse pointers.
 */
export function CursorGlowCard({
  className,
  children,
  'aria-label': ariaLabel = 'Product preview',
}: CursorGlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tracking, setTracking] = useState(false)

  const setSpot = useCallback((xPercent: number, yPercent: number) => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--spot-x', `${xPercent}%`)
    el.style.setProperty('--spot-y', `${yPercent}%`)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Coarse pointers never track (CSS also hides the spot)
      if (e.pointerType === 'touch') return
      const el = cardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      if (!tracking) setTracking(true)
      setSpot(x, y)
    },
    [setSpot, tracking]
  )

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch') return
      setTracking(true)
      // Immediate snap on enter — no lag in base form
      const el = cardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setSpot(x, y)
    },
    [setSpot]
  )

  const handlePointerLeave = useCallback(() => {
    setTracking(false)
    // Ease back to rest (transition enabled when not tracking)
    setSpot(REST_X, REST_Y)
  }, [setSpot])

  return (
    <div
      ref={cardRef}
      className={cn(
        'cursor-glow-card relative overflow-hidden rounded-lg border border-border bg-bg-surface',
        tracking && 'is-tracking',
        className
      )}
      style={
        {
          '--spot-x': `${REST_X}%`,
          '--spot-y': `${REST_Y}%`,
        } as React.CSSProperties
      }
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      aria-label={ariaLabel}
    >
      <span className="cursor-glow-spot" aria-hidden="true" />
      <div className="relative z-[1] h-full w-full min-h-[280px] md:min-h-[320px]">
        {children}
      </div>
    </div>
  )
}

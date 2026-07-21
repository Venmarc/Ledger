'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const REVEAL = 80
const THRESHOLD = 48

type Props = {
  children: React.ReactNode
  onDeleteRequest: () => void
  className?: string
}

/**
 * Mobile swipe-left reveals Delete. Desktop uses the ⋮ menu instead.
 */
export function SwipeableRow({ children, onDeleteRequest, className }: Props) {
  const [offset, setOffset] = React.useState(0)
  const startX = React.useRef(0)
  const startOffset = React.useRef(0)
  const dragging = React.useRef(false)

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startOffset.current = offset
    dragging.current = true
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const dx = e.touches[0].clientX - startX.current
    const next = Math.min(0, Math.max(-REVEAL, startOffset.current + dx))
    setOffset(next)
  }

  const onTouchEnd = () => {
    dragging.current = false
    setOffset((o) => (o < -THRESHOLD ? -REVEAL : 0))
  }

  return (
    <div className={cn('relative overflow-hidden md:overflow-visible', className)}>
      <div
        className="absolute inset-y-0 right-0 flex w-20 items-stretch md:hidden"
        aria-hidden={offset > -THRESHOLD}
      >
        <button
          type="button"
          onClick={() => {
            setOffset(0)
            onDeleteRequest()
          }}
          className="flex w-full items-center justify-center bg-red text-sm font-semibold text-white cursor-pointer"
        >
          Delete
        </button>
      </div>
      <div
        className="relative bg-bg-base transition-transform duration-150 ease-out md:[transform:none]!"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipPortalProps {
  children: React.ReactNode
  content: string
  disabled?: boolean
}

export function TooltipPortal({ children, content, disabled = false }: TooltipPortalProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleScroll = () => {
      setIsOpen(false)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    const scrollContainers = document.querySelectorAll('.sidebar-nav')
    scrollContainers.forEach((el) => {
      el.addEventListener('scroll', handleScroll, { passive: true })
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      scrollContainers.forEach((el) => {
        el.removeEventListener('scroll', handleScroll)
      })
    }
  }, [isOpen])

  if (disabled || !mounted) {
    return <>{children}</>
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    })
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 75)
  }

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isOpen && coords && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            transform: 'translateY(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="bg-bg-elevated border border-border text-text-primary px-3 py-1.5 rounded-md text-xs font-medium shadow-md font-body whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
        >
          {content}
        </div>,
        document.body
      )}
    </>
  )
}

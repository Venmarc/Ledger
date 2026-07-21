import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** Wordmark next to icon. Always hidden below md (mobile = solo). */
  showText?: boolean
  size?: number
  /** Override home href (default `/`). */
  href?: string
}

/**
 * Ledger mark — always loads `/logo.svg` from public.
 * Entire lockup links to the homepage (mobile + desktop).
 * Glow / lift behavior lives in globals.css (UIUX_BRIEF §5).
 */
export function Logo({
  className = '',
  showText = false,
  size = 32,
  href = '/',
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'logo-lockup flex items-center gap-3 select-none outline-none focus-visible:outline-none',
        className
      )}
      aria-label="Ledger home"
    >
      <span
        className="logo-container inline-flex shrink-0 items-center justify-center"
        style={{ width: size, height: size }}
        aria-hidden={true}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset from public/ */}
        <img
          src="/logo.svg"
          alt=""
          width={size}
          height={size}
          className="logo-icon logo-solo"
          draggable={false}
        />
      </span>
      {showText && (
        <span className="logo-text hidden md:inline font-display font-bold text-xl text-text-primary tracking-tight">
          Ledger
        </span>
      )}
    </Link>
  )
}

import React from 'react'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: number
}

export function Logo({ className = '', showText = false, size = 32 }: LogoProps) {
  return (
    <div className={`logo-lockup flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-icon logo-solo transition-all duration-200"
      >
        {/* Logo geometry from Brandkit: sharp square outline with diagonal path */}
        <rect
          x="4"
          y="4"
          width="32"
          height="32"
          rx="6"
          stroke="currentColor"
          strokeWidth="3.5"
          className="text-text-primary"
        />
        <path
          d="M12 28L28 12M28 12H20M28 12V20"
          stroke="var(--color-orange)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className="logo-text font-display font-bold text-xl text-text-primary tracking-tight">
          Ledger
        </span>
      )}
    </div>
  )
}

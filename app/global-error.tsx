'use client'

import React from 'react'

/**
 * Global error boundary must set its own html/body — no app layout tokens available.
 * Hex values here mirror dark theme tokens from globals.css (intentional isolation).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error('Unhandled global error:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body
        className="min-h-screen flex items-center justify-center font-sans antialiased p-6"
        style={{
          backgroundColor: '#0A0A0A',
          color: '#F5F5F5',
        }}
      >
        <div
          className="max-w-md w-full rounded-lg p-6 space-y-6 text-center shadow-lg"
          style={{
            border: '1px solid #3A3A3A',
            backgroundColor: '#141414',
          }}
        >
          <div className="space-y-2">
            <h1
              className="text-2xl font-bold font-display"
              style={{ color: '#EF4444' }}
            >
              System Error
            </h1>
            <p className="text-sm" style={{ color: '#A3A3A3' }}>
              A fatal application error has occurred. Ledger was forced to halt.
            </p>
          </div>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full h-11 font-bold rounded-md transition-colors cursor-pointer"
            style={{ backgroundColor: '#F97316', color: '#0A0A0A' }}
          >
            Retry Application
          </button>
        </div>
      </body>
    </html>
  )
}

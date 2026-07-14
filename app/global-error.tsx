'use client'

import React from 'react'

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
      <body className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-[#F5F5F5] font-sans antialiased p-6">
        <div className="max-w-md w-full border border-[#3A3A3A] bg-[#141414] rounded-lg p-6 space-y-6 text-center shadow-lg">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display text-[#EF4444]">System Error</h1>
            <p className="text-sm text-[#A3A3A3]">
              A fatal application error has occurred. Ledger was forced to halt.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full h-11 bg-[#F97316] text-[#0A0A0A] font-bold rounded-md hover:bg-[#EA6C0A] transition-colors cursor-pointer"
          >
            Retry Application
          </button>
        </div>
      </body>
    </html>
  )
}

'use client'

import React from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error('App runtime error boundary caught error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border border-[#2A2A2A] bg-[#141414] rounded-lg p-8 space-y-6 text-center">
      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-bold font-display text-[#EF4444]">Module Error</h2>
        <p className="text-sm text-[#A3A3A3]">
          There was an error loading this section of the app.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="h-10 px-6 bg-[#F97316] text-[#0A0A0A] font-bold rounded-md hover:bg-[#EA6C0A] transition-colors cursor-pointer"
      >
        Reload Module
      </button>
    </div>
  )
}

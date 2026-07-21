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
    <div className="flex flex-col items-center justify-center min-h-[400px] border border-border bg-bg-surface rounded-lg p-8 space-y-6 text-center">
      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-bold font-display text-red">Module Error</h2>
        <p className="text-sm text-text-secondary">
          There was an error loading this section of the app.
        </p>
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="h-11 min-h-11 px-6 bg-orange text-orange-btn-text font-bold rounded-md hover:bg-orange-hover transition-colors cursor-pointer"
      >
        Reload Module
      </button>
    </div>
  )
}

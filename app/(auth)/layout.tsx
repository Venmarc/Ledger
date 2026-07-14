'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      if (isMounted) {
        setMounted(true)
      }
    }, 16)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[480px] space-y-8 flex flex-col items-center justify-center">
        {children}
        {mounted && (
          <>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(4px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <Link
              href="/"
              style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 opacity-0"
            >
              ← Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

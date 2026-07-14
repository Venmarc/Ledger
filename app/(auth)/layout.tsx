'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      if (isMounted) {
        setMounted(true)
        setVisible(true)
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
          <Link
            href="/"
            className={`text-sm text-text-secondary hover:text-text-primary transition-opacity duration-500 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            ← Back to home
          </Link>
        )}
      </div>
    </div>
  )
}

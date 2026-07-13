'use client'

import React from 'react'
import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from './theme-toggle'
import { Logo } from './logo'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()

  // Determine if we are at the main dashboard root
  const isRoot = pathname === '/dashboard' || pathname === '/'

  // Clean title mapping
  const getPageTitle = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return 'Home'
    const lastSegment = segments[segments.length - 1]
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="flex h-16 items-center justify-between px-4 md:px-8 border-b border-border bg-bg-surface/80 backdrop-blur-md sticky top-0 z-30">
      {/* Left side: Back Button or Logo (Mobile) / Page Title (Desktop) */}
      <div className="flex items-center gap-3">
        {!isRoot ? (
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-subtle text-text-secondary hover:text-text-primary active:scale-[0.95] transition-all duration-150 cursor-pointer border border-border"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="md:hidden">
            <Logo showText size={28} />
          </div>
        )}

        <h1 className="hidden md:block text-lg font-bold font-display text-text-primary">
          {pageTitle}
        </h1>
      </div>

      {/* Right side cluster: Toggle sits closest to center, UserButton on far right */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  )
}

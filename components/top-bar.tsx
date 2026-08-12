'use client'

import React from 'react'
import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from './theme-toggle'
import { Logo } from './logo'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, Settings } from 'lucide-react'

import { useGoal } from '@/lib/hooks/use-goals'

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Determine if we are at the main dashboard root
  const isRoot = pathname === '/dashboard' || pathname === '/'
  // /recurring is sidebar-primary on desktop, so it should not show a back
  // chevron there. On mobile it is reached via Settings (sub-page) and keeps
  // the back chevron. Full route-classification pass is deferred (see NOTES).
  const isDesktopPrimary = !isMobile && pathname === '/recurring'
  const showBack = !isRoot && !isDesktopPrimary

  const segments = pathname.split('/').filter(Boolean)
  const isGoalDetail = segments.length === 2 && segments[0] === 'goals'
  const goalId = isGoalDetail ? segments[1] : undefined
  const { data: goal } = useGoal(goalId)

  // Clean title mapping
  const getPageTitle = () => {
    if (segments.length === 0) return 'Home'
    if (isGoalDetail) {
      return goal?.title ?? 'Goal Details'
    }
    if (segments.length === 2 && segments[0] === 'transactions') {
      return 'Transaction Details'
    }
    const lastSegment = segments[segments.length - 1]
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }

  const pageTitle = getPageTitle()

  return (
    <header className="flex h-16 items-center justify-between px-4 md:px-8 border-b border-border bg-bg-surface/80 backdrop-blur-md sticky top-0 z-30">
      {/* Left side: Back Button or Logo (Mobile) / Page Title (Desktop) */}
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-subtle text-text-secondary hover:text-text-primary active:scale-[0.95] transition-all duration-150 cursor-pointer border border-border"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="md:hidden">
            {/* Mobile: logo always solo (logo_behavior.md / UIUX §5.6) */}
            <Logo showText={false} size={28} />
          </div>
        )}

        <h1 className="hidden md:block text-lg font-bold font-display text-text-primary">
          {pageTitle}
        </h1>
      </div>

      {/* Right side cluster: Toggle sits closest to center, Settings icon
          (mobile-only) and UserButton on far right. Desktop has Settings in
          the sidebar so no top-bar icon there. */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link
          href="/settings"
          aria-label="Settings"
          className="md:hidden flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-transparent text-text-secondary transition-all duration-150 hover:bg-bg-subtle hover:text-text-primary active:scale-[0.92]"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <UserButton />
      </div>
    </header>
  )
}

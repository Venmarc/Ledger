'use client'

import React from 'react'
import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from './theme-toggle'
import { Logo } from './logo'
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
            {/* Mobile: logo always solo (logo_behavior.md / UIUX §5.6) */}
            <Logo showText={false} size={28} />
          </div>
        )}

        <h1 className="hidden md:block text-lg font-bold font-display text-text-primary">
          {pageTitle}
        </h1>
      </div>

      {/* Right side cluster: Toggle sits closest to center, UserButton on far right */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserButton>
          <UserButton.MenuItems>
            {isMobile && (
              <UserButton.Link
                label="Settings"
                labelIcon={<Settings className="w-4 h-4" />}
                href="/settings"
              />
            )}
          </UserButton.MenuItems>
        </UserButton>
      </div>
    </header>
  )
}

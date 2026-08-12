'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  Target,
  BarChart3,
  RefreshCw,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Logo } from './logo'
import { useUIStore } from '@/lib/store'
import { TooltipPortal } from './ui/tooltip-portal'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: Receipt },
  { label: 'Budgets', href: '/budgets', icon: Landmark },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Recurring', href: '/recurring', icon: RefreshCw },
  { label: 'Settings', href: '/settings', icon: Settings },
]

/**
 * Fixed icon rail: icons keep a constant left inset whether collapsed or expanded.
 * Only the container width + label text expand toward the right — never
 * justify-center (that caused ~96px icon drift mid-collapse).
 */
const ICON_INSET = 'pl-3.5' // 14px — matches collapsed icon optical center

export function Sidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isCollapsed = mounted ? sidebarCollapsed : true

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        willChange: 'width',
      }}
      className={cn(
        'fixed left-0 top-0 z-30 hidden h-screen flex-col justify-between border-r border-border bg-bg-surface pb-5 md:flex',
        'transition-[width] duration-[var(--duration-normal)] [transition-timing-function:var(--ease-smooth)]'
      )}
    >
      <button
        type="button"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-[10000] flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary shadow-sm transition-colors duration-[var(--duration-fast)] hover:bg-bg-subtle hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      <div className="flex min-h-0 flex-1 flex-col space-y-6 overflow-hidden">
        {/* Logo band: fixed 64px height matches TopBar's h-16 so the logo's
            vertical center lines up with the topbar's bottom border across
            the sidebar/topbar boundary — never centered horizontally. */}
        <div className={cn('flex h-16 shrink-0 items-center', ICON_INSET, 'pr-3.5')}>
          <Logo showText={!isCollapsed} size={28} />
        </div>

        <nav
          className={cn(
            'sidebar-nav flex min-h-0 flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto ledger-scroll py-2',
            'pr-2 pl-2'
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <TooltipPortal
                key={item.href}
                text={item.label}
                disabled={!isCollapsed}
              >
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    // Always start-aligned — icons never re-center on collapse
                    'flex items-center gap-3 rounded-md py-2.5 text-sm',
                    ICON_INSET,
                    'pr-3.5',
                    'transition-[background-color,color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-smooth)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface',
                    isActive
                      ? 'bg-azure-muted font-medium text-azure'
                      : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-azure' : 'text-text-secondary'
                    )}
                  />
                  {/* Label clips in place; width of rail grows rightward only */}
                  <span
                    className={cn(
                      'min-w-0 truncate whitespace-nowrap',
                      'transition-[opacity,max-width] duration-[var(--duration-normal)] [transition-timing-function:var(--ease-smooth)]',
                      isCollapsed
                        ? 'max-w-0 opacity-0'
                        : 'max-w-[11rem] opacity-100'
                    )}
                    aria-hidden={isCollapsed}
                  >
                    {item.label}
                  </span>
                </Link>
              </TooltipPortal>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

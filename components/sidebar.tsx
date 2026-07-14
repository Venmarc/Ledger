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
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Logo } from './logo'
import { useUIStore } from '@/lib/store'
import { TooltipPortal } from './ui/tooltip-portal'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: Receipt },
  { label: 'Budgets', href: '/budgets', icon: Landmark },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Default to true (collapsed) during SSR/hydration to match server rendering
  const isCollapsed = mounted ? sidebarCollapsed : true

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        willChange: 'width',
      }}
      className="fixed left-0 top-0 z-30 hidden md:flex flex-col bg-bg-surface border-r border-border h-screen py-5 transition-[width] duration-200 ease-out justify-between"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute top-6 -right-3 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-colors duration-200 cursor-pointer shadow-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      <div className="space-y-8 flex flex-col min-h-0">
        {/* Logo block */}
        <div className={`flex ${isCollapsed ? 'justify-center' : 'px-5'}`}>
          <Link href="/" className="block">
            <Logo showText={!isCollapsed} size={36} />
          </Link>
        </div>
        
        {/* Navigation block */}
        <nav className={`sidebar-nav flex flex-col gap-1 overflow-y-auto overflow-x-hidden no-scrollbar ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <TooltipPortal key={item.href} text={item.label} disabled={!isCollapsed}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={`flex items-center rounded-md text-sm transition-colors duration-150 ${
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-azure-muted text-azure font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-subtle'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-azure' : 'text-text-secondary'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </TooltipPortal>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

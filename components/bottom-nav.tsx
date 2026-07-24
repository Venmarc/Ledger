'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Landmark, Target, BarChart3 } from 'lucide-react'

const mobileNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: Receipt },
  { label: 'Budgets', href: '/budgets', icon: Landmark },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
]

function isNavActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-bg-surface border-t border-border flex items-center justify-around z-40 px-2">
      {mobileNavItems.map((item) => {
        const Icon = item.icon
        const isActive = isNavActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center relative ${
              isActive ? 'text-azure' : 'text-text-secondary'
            }`}
          >
            <Icon className="w-6 h-6 mb-0.5" />
            <span className={`text-[10px] ${isActive ? 'text-azure font-medium' : 'text-text-tertiary'}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 bg-azure rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

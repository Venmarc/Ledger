'use client'

import React, { useEffect, useState } from 'react'
import { useUIStore } from '@/lib/store'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isCollapsed = mounted ? sidebarCollapsed : true
  const width = isCollapsed ? '68px' : '260px'

  return (
    <div
      style={{ '--sidebar-width': width } as React.CSSProperties}
      className="flex min-h-screen bg-bg-base text-text-primary"
    >
      {children}
    </div>
  )
}

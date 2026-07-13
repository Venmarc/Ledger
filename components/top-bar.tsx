'use client'

import React from 'react'
import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from './theme-toggle'
import { Logo } from './logo'

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between px-4 md:px-8 border-b border-border bg-bg-surface/80 backdrop-blur-md sticky top-0 z-30">
      {/* Mobile Logo */}
      <div className="md:hidden">
        <Logo showText size={28} />
      </div>
      
      {/* Spacer to balance layout on desktop */}
      <div className="hidden md:block" />

      {/* Right side cluster: Toggle sits closest to center, UserButton on far right */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  )
}

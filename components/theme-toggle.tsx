'use client'

import React, { useCallback, useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './theme-provider'

/**
 * Theme toggle. Renders a stable shell on the server, then attaches
 * handlers after mount so hydration never fights localStorage.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => true,
    () => false,
  )

  return (
    <button
      type="button"
      onClick={() => {
        if (!mounted) return
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-transparent text-text-secondary transition-all duration-150 hover:bg-bg-subtle hover:text-text-primary active:scale-[0.92] md:h-9 md:w-9"
      aria-label="Toggle theme"
      aria-pressed={mounted ? theme === 'dark' : undefined}
      suppressHydrationWarning
    >
      {/* Prefer dark-mode sun as default so SSR matches default data-theme="dark" */}
      {(!mounted || theme === 'dark') ? (
        <Sun className="h-5 w-5 transition-transform duration-150 md:h-[18px] md:w-[18px]" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-150 md:h-[18px] md:w-[18px]" />
      )}
    </button>
  )
}

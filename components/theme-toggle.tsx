'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary active:scale-92 transition-all duration-150 cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5 md:w-[18px] md:h-[18px] transition-transform duration-150" />
      ) : (
        <Sun className="w-5 h-5 md:w-[18px] md:h-[18px] transition-transform duration-150" />
      )}
    </button>
  )
}

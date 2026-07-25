import * as React from 'react'
import { getCategoryIconComponent } from '@/lib/category-icons'
import { cn } from '@/lib/utils'

export interface CategoryIconProps {
  iconName?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CategoryIcon({
  iconName,
  size = 'md',
  className,
}: CategoryIconProps) {
  const Icon = getCategoryIconComponent(iconName)

  const containerSizes = {
    sm: 'h-8 w-8 min-w-8',
    md: 'h-10 w-10 min-w-10',
    lg: 'h-12 w-12 min-w-12',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-muted)] text-[var(--color-neutral)]',
        containerSizes[size],
        className
      )}
      aria-hidden
    >
      <Icon className={iconSizes[size]} />
    </span>
  )
}

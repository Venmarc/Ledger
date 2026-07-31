import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 text-center',
        className
      )}
    >
      <Icon className="h-12 w-12 text-text-tertiary" aria-hidden />
      <p className="mt-3 text-sm font-medium text-text-secondary">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-text-tertiary">{description}</p>
      ) : null}
    </div>
  )
}

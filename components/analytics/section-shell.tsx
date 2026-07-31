import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SectionShellProps = {
  title: string
  children: ReactNode
  className?: string
  ariaLabel?: string
}

export function SectionShell({
  title,
  children,
  className,
  ariaLabel,
}: SectionShellProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-bg-surface p-4 shadow-card md:p-5',
        className
      )}
      aria-label={ariaLabel ?? title}
    >
      <h2 className="font-display text-lg font-semibold text-text-primary">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

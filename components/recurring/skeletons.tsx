'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

function Bone({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Skeleton
      className={cn('bg-bg-subtle animate-pulse', className)}
      {...props}
    />
  )
}

export function RecurringRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-surface p-4 shadow-card">
      <Bone className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Bone className="h-4 w-32" />
        <Bone className="h-3 w-24" />
      </div>
      <Bone className="h-6 w-12 shrink-0 rounded-full" />
    </div>
  )
}

export function RecurringListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy aria-label="Loading recurring templates">
      {Array.from({ length: count }).map((_, i) => (
        <RecurringRowSkeleton key={i} />
      ))}
    </div>
  )
}

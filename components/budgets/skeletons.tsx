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

export function BudgetSummarySkeleton() {
  return (
    <div
      className="rounded-xl border border-border bg-bg-surface p-4 shadow-card"
      aria-busy
      aria-label="Loading budget summary"
    >
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-3 w-16" />
            <Bone className="h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BudgetCardSkeleton({
  variant = 'list',
}: {
  variant?: 'list' | 'dashboard'
}) {
  if (variant === 'dashboard') {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-card">
        <div className="flex min-w-0 items-start gap-2">
          <Bone className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Bone className="h-4 w-24" />
            <Bone className="h-3 w-14" />
          </div>
        </div>
        <Bone className="mt-3 h-1.5 w-full rounded-full" />
        <div className="mt-2 space-y-1.5">
          <Bone className="h-3 w-32" />
          <Bone className="h-3 w-20" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Bone className="h-10 w-10 shrink-0 rounded-full" />
          <Bone className="h-4 w-24" />
        </div>
        <Bone className="h-4 w-16 shrink-0" />
      </div>
      <Bone className="mt-3 h-1.5 w-full rounded-full" />
      <div className="mt-2 flex justify-between gap-3">
        <Bone className="h-3 w-32" />
        <Bone className="h-3 w-20" />
      </div>
    </div>
  )
}

export function BudgetListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
      aria-busy
      aria-label="Loading budgets"
    >
      {Array.from({ length: count }).map((_, i) => (
        <BudgetCardSkeleton key={i} />
      ))}
    </div>
  )
}

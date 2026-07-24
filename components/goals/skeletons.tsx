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

export function GoalCardSkeleton() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-bg-surface p-4 shadow-card">
      <div className="w-full space-y-1 text-center">
        <Bone className="mx-auto h-5 w-32" />
        <Bone className="mx-auto h-3 w-20" />
      </div>
      <div className="my-4 flex items-center justify-center">
        <Bone className="h-20 w-20 rounded-full" />
      </div>
      <Bone className="h-5 w-36" />
      <Bone className="mt-4 h-1.5 w-full rounded-full" />
    </div>
  )
}

export function GoalListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
      aria-busy
      aria-label="Loading savings goals"
    >
      {Array.from({ length: count }).map((_, i) => (
        <GoalCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function GoalDetailSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy
      aria-label="Loading goal details"
    >
      <div className="flex items-center gap-2">
        <Bone className="h-4 w-16" />
      </div>
      <div className="space-y-2">
        <Bone className="h-7 w-48" />
        <Bone className="h-4 w-72" />
      </div>
      <div className="my-8 flex justify-center">
        <Bone className="h-40 w-40 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-bg-surface p-4 shadow-card">
        <div className="space-y-2">
          <Bone className="h-3 w-12" />
          <Bone className="h-5 w-20" />
        </div>
        <div className="space-y-2">
          <Bone className="h-3 w-12" />
          <Bone className="h-5 w-20" />
        </div>
        <div className="space-y-2">
          <Bone className="h-3 w-16" />
          <Bone className="h-5 w-20" />
        </div>
      </div>
      <Bone className="h-12 w-full rounded-lg" />
    </div>
  )
}

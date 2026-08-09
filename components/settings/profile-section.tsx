'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { SectionShell } from '@/components/analytics/section-shell'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileSection() {
  const { user, isLoaded } = useUser()
  const { openUserProfile } = useClerk()

  return (
    <SectionShell title="Profile" ariaLabel="Profile">
      {!isLoaded ? (
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Clerk-hosted avatar, no remotePatterns configured
            <img
              src={user.imageUrl}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 shrink-0 rounded-full bg-bg-subtle" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-text-primary">
              {user?.fullName || 'User'}
            </p>
            <p className="truncate text-sm text-text-secondary">
              {user?.primaryEmailAddress?.emailAddress ?? ''}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => openUserProfile()}
        className="mt-4 min-h-11 text-sm font-medium text-azure hover:underline cursor-pointer"
      >
        Edit profile
      </button>
    </SectionShell>
  )
}

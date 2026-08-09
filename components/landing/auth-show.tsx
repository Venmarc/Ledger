'use client'

import { useAuth } from '@clerk/nextjs'
import type { ReactNode } from 'react'

/**
 * Client-side replacement for Clerk's server `Show` control component.
 *
 * The landing page is `force-static` (see PHASES.md §5 / PAGE_SPECS gate
 * requirements), but Clerk's `<Show when="…">` is an async server component
 * that calls `auth()` at prerender time — impossible for a statically
 * generated route, which has no request context during export.
 *
 * So auth-state-dependent rendering is resolved **after mount** here: on the
 * server/prerender pass we optimistically render the signed-out branch, then
 * swap to the correct branch once Clerk has hydrated. This keeps `/` fully
 * static while still showing the signed-in/out variants after load.
 */
export function AuthShow({
  when,
  children,
  fallback,
}: {
  when: 'signed-in' | 'signed-out'
  children: ReactNode
  fallback?: ReactNode
}) {
  const { isLoaded, isSignedIn } = useAuth()

  // Prerender / SSR (auth not yet hydrated): assume signed-out so the shipped
  // static HTML shows the public landing variant and there's no FOUC toward
  // the wrong state.
  const shouldShow = !isLoaded
    ? when === 'signed-out'
    : when === 'signed-in'
      ? !!isSignedIn
      : !isSignedIn

  return <>{shouldShow ? children : fallback ?? null}</>
}
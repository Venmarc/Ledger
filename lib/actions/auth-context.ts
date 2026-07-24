'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { SupabaseClient } from '@supabase/supabase-js'

export type AuthedContext =
  | {
      ok: true
      userId: string
      supabase: SupabaseClient
      /** jwt = Clerk template + RLS; service_role = app-level user_id scoping */
      authMode: 'jwt' | 'service_role'
    }
  | {
      ok: false
      error: string
    }

/**
 * Resolve Clerk user + Supabase client for RLS-safe data access.
 *
 * Preferred: Clerk JWT template named `supabase` (Custom Session Token).
 * Fallback: service role after Clerk auth, with every query still scoped by userId
 * (needed when the JWT template is missing or misconfigured — e.g. after project
 * pause when the Clerk↔Supabase bridge was never finished).
 */
export async function getAuthedContext(): Promise<AuthedContext> {
  try {
    const { userId, getToken } = await auth()
    if (!userId) {
      return { ok: false, error: 'Not signed in' }
    }

    let token: string | null = null
    let tokenError: string | null = null
    try {
      token = await getToken({ template: 'supabase' })
    } catch (err) {
      tokenError = err instanceof Error ? err.message : String(err)
      console.error('Clerk getToken({ template: "supabase" }) failed:', err)
    }

    if (token) {
      try {
        const supabase = await createClient(token)
        return { ok: true, userId, supabase, authMode: 'jwt' }
      } catch (err) {
        console.error('createClient(token) failed:', err)
        tokenError = err instanceof Error ? err.message : String(err)
      }
    }

    // Fallback path — still requires signed-in Clerk user
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        ok: false,
        error:
          tokenError
            ? `Clerk JWT template "supabase" failed (${tokenError}). Also missing SUPABASE_SERVICE_ROLE_KEY fallback.`
            : 'Could not authorize database access. Create a Clerk JWT template named "supabase" (or set SUPABASE_SERVICE_ROLE_KEY for server fallback).',
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[ledger/auth] Using service-role fallback (Clerk JWT template "supabase" returned no token). Queries are still scoped by Clerk userId.'
      )
    }

    try {
      const supabase = createServiceClient()
      return { ok: true, userId, supabase, authMode: 'service_role' }
    } catch (err) {
      console.error('createServiceClient failed:', err)
      return {
        ok: false,
        error: `Database client creation failed: ${err instanceof Error ? err.message : String(err)}`,
      }
    }
  } catch (err) {
    console.error('getAuthedContext uncaught error:', err)
    return {
      ok: false,
      error: `Auth error: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}

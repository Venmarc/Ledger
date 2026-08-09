'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getAuthedContext } from '@/lib/actions/auth-context'
import { fail, ok, type ActionResult } from '@/lib/actions/result'
import { paymentMethodSchema } from '@/lib/validations/transaction'
import type { Profile } from '@/lib/types/database'

export async function syncUserProfile() {
  const { userId, getToken } = await auth()
  if (!userId) return null

  let token: string | null = null
  try {
    token = await getToken({ template: 'supabase' })
  } catch (err) {
    console.error('Clerk getToken custom template error:', err)
  }

  // Prefer JWT (RLS). Fall back to service role so pause/resume + missing JWT
  // template cannot block profile creation entirely.
  const supabase = token
    ? await createClient(token)
    : createServiceClient()

  const user = await currentUser()
  if (!user) return null

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
  const avatarUrl = user.imageUrl || ''

  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName || 'User',
      avatar_url: avatarUrl,
      base_currency: 'NGN',
      timezone: 'Africa/Lagos',
    })
    .select()
    .single()

  if (error) {
    console.error('Profile sync failed:', error)
    return null
  }

  return profile
}

export async function getProfile(): Promise<ActionResult<Profile>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const { data, error } = await ctx.supabase
    .from('profiles')
    .select('*')
    .eq('id', ctx.userId)
    .maybeSingle()

  if (error) {
    console.error('getProfile:', error)
    return fail('Could not load profile')
  }
  if (!data) return fail('Profile not found')

  return ok(data as Profile)
}

export async function updateDefaultPaymentMethod(
  method: string | null
): Promise<ActionResult<Profile>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = paymentMethodSchema.nullable().safeParse(method)
  if (!parsed.success) return fail('Invalid payment method')

  const { data, error } = await ctx.supabase
    .from('profiles')
    .update({ default_payment_method: parsed.data })
    .eq('id', ctx.userId)
    .select()
    .single()

  if (error) {
    console.error('updateDefaultPaymentMethod:', error)
    return fail('Could not update default payment method')
  }

  return ok(data as Profile)
}

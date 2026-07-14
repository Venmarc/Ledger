'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function syncUserProfile() {
  const { userId, getToken } = await auth()
  if (!userId) return null

  let token: string | null = null
  try {
    token = await getToken({ template: 'supabase' })
  } catch (err) {
    console.error('Clerk getToken custom template error:', err)
  }
  const supabase = await createClient(token || undefined)

  // Retrieve Clerk user information and upsert directly (keeps profile details fresh on every sign-in)
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

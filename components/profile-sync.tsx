'use client'

import { useEffect } from 'react'
import { syncUserProfile } from '@/lib/actions/profile'

export function ProfileSync() {
  useEffect(() => {
    syncUserProfile().catch((err) => {
      console.error('Async profile sync error:', err)
    })
  }, [])

  return null
}

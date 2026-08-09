'use client'

import { useClerk } from '@clerk/nextjs'
import { SectionShell } from '@/components/analytics/section-shell'
import { SecondaryButton } from '@/components/transactions'

export function AccountSection() {
  const { signOut } = useClerk()

  return (
    <SectionShell title="Account" ariaLabel="Account">
      <SecondaryButton onClick={() => signOut({ redirectUrl: '/' })}>
        Sign out
      </SecondaryButton>
    </SectionShell>
  )
}

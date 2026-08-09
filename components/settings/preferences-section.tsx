'use client'

import { SectionShell } from '@/components/analytics/section-shell'
import { PaymentMethodSelect } from '@/components/transactions'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile, useUpdateDefaultPaymentMethod } from '@/lib/hooks/use-profile'

export function PreferencesSection() {
  const { data: profile, isLoading } = useProfile()
  const updateMutation = useUpdateDefaultPaymentMethod()

  return (
    <SectionShell title="Preferences" ariaLabel="Preferences">
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <PaymentMethodSelect
          label="Default payment method"
          value={profile?.default_payment_method ?? null}
          onChange={(method) => updateMutation.mutate(method)}
          disabled={updateMutation.isPending}
        />
      )}
      <p className="mt-2 text-xs text-text-tertiary">
        Pre-fills the payment method when you log a new transaction.
      </p>
    </SectionShell>
  )
}

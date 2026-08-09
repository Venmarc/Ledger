'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateDefaultPaymentMethod } from '@/lib/actions/profile'
import { queryKeys } from '@/lib/query-keys'
import type { PaymentMethod, Profile } from '@/lib/types/database'

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.all(),
    queryFn: async () => {
      const result = await getProfile()
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
  })
}

export function useUpdateDefaultPaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (method: PaymentMethod | null) => {
      const result = await updateDefaultPaymentMethod(method)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: (profile) => {
      queryClient.setQueryData<Profile>(queryKeys.profile.all(), profile)
    },
  })
}

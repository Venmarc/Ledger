'use client'

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  archiveGoal,
  contributeToGoal,
  createGoal,
  deleteGoal,
  getGoal,
  listGoals,
  updateGoal,
  type ListGoalsScope,
} from '@/lib/actions/goals'
import { queryKeys } from '@/lib/query-keys'
import type {
  ContributeGoalInput,
  CreateGoalInput,
  UpdateGoalInput,
} from '@/lib/validations/goal'

function invalidateGoals(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all() })
}

export function useGoals(scope: ListGoalsScope = 'active') {
  return useQuery({
    queryKey: queryKeys.goals.list(scope),
    queryFn: async () => {
      const result = await listGoals(scope)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
  })
}

export function useGoal(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.goals.detail(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Goal id required')
      const result = await getGoal(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    enabled: Boolean(id),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const result = await createGoal(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateGoals(queryClient)
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateGoalInput) => {
      const result = await updateGoal(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateGoals(queryClient)
    },
  })
}

export function useContributeGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ContributeGoalInput) => {
      const result = await contributeToGoal(input)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateGoals(queryClient)
    },
  })
}

export function useArchiveGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await archiveGoal(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateGoals(queryClient)
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteGoal(id)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      invalidateGoals(queryClient)
    },
  })
}

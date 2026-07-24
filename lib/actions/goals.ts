'use server'

import { z } from 'zod'
import { getAuthedContext } from '@/lib/actions/auth-context'
import { fail, ok, type ActionResult } from '@/lib/actions/result'
import type { SavingsGoal, SavingsGoalView } from '@/lib/types/database'
import {
  contributeGoalSchema,
  createGoalSchema,
  updateGoalSchema,
  type ContributeGoalInput,
  type CreateGoalInput,
  type UpdateGoalInput,
} from '@/lib/validations/goal'

function parseAmount(value: string | number): number {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

/** Row → view model for UI (P2-A SavingsGoalView). Private — not a server action. */
function toGoalView(row: SavingsGoal): SavingsGoalView {
  const current = parseAmount(row.current_amount)
  const target = parseAmount(row.target_amount)
  const ratio = target > 0 ? current / target : 0
  return {
    ...row,
    current,
    target,
    ratio,
    isCompleted: current >= target && target > 0,
  }
}

export type ListGoalsScope = 'active' | 'archived' | 'all'

export async function listGoals(
  scope: ListGoalsScope = 'active'
): Promise<ActionResult<SavingsGoalView[]>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  let q = ctx.supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false })

  if (scope === 'active') q = q.eq('is_active', true)
  if (scope === 'archived') q = q.eq('is_active', false)

  const { data, error } = await q

  if (error) {
    console.error('listGoals:', error)
    return fail('Could not load goals')
  }

  const views = (data as SavingsGoal[]).map(toGoalView)

  if (scope === 'active') {
    views.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    })
  }

  return ok(views)
}

export async function getGoal(
  id: string
): Promise<ActionResult<SavingsGoalView>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const idParsed = z.string().uuid().safeParse(id)
  if (!idParsed.success) return fail('Invalid goal id')

  const { data, error } = await ctx.supabase
    .from('savings_goals')
    .select('*')
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (error) {
    console.error('getGoal:', error)
    return fail('Could not load goal')
  }
  if (!data) return fail('Goal not found')

  return ok(toGoalView(data as SavingsGoal))
}

export async function createGoal(
  input: CreateGoalInput
): Promise<ActionResult<SavingsGoalView>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = createGoalSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid goal')
  }

  const { data, error } = await ctx.supabase
    .from('savings_goals')
    .insert({
      user_id: ctx.userId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      target_amount: parsed.data.target_amount,
      current_amount: parsed.data.current_amount ?? 0,
      target_date: parsed.data.target_date ?? null,
      is_active: true,
    })
    .select('*')
    .single()

  if (error) {
    console.error('createGoal:', error)
    return fail('Could not create goal')
  }

  return ok(toGoalView(data as SavingsGoal))
}

export async function updateGoal(
  input: UpdateGoalInput
): Promise<ActionResult<SavingsGoalView>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = updateGoalSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid update')
  }

  const { data: existing, error: loadError } = await ctx.supabase
    .from('savings_goals')
    .select('*')
    .eq('id', parsed.data.id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('updateGoal load:', loadError)
    return fail('Could not load goal')
  }
  if (!existing) return fail('Goal not found')

  const patch: Record<string, unknown> = {}
  if (parsed.data.title !== undefined) patch.title = parsed.data.title
  if (parsed.data.description !== undefined) {
    patch.description = parsed.data.description
  }
  if (parsed.data.target_amount !== undefined) {
    patch.target_amount = parsed.data.target_amount
  }
  if (parsed.data.target_date !== undefined) {
    patch.target_date = parsed.data.target_date
  }

  if (Object.keys(patch).length === 0) {
    return ok(toGoalView(existing as SavingsGoal))
  }

  const { data, error } = await ctx.supabase
    .from('savings_goals')
    .update(patch)
    .eq('id', parsed.data.id)
    .eq('user_id', ctx.userId)
    .select('*')
    .single()

  if (error) {
    console.error('updateGoal:', error)
    return fail('Could not update goal')
  }

  return ok(toGoalView(data as SavingsGoal))
}

export async function contributeToGoal(
  input: ContributeGoalInput
): Promise<ActionResult<SavingsGoalView>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = contributeGoalSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid contribution')
  }

  const { data: existing, error: loadError } = await ctx.supabase
    .from('savings_goals')
    .select('*')
    .eq('id', parsed.data.id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('contributeToGoal load:', loadError)
    return fail('Could not load goal')
  }
  if (!existing) return fail('Goal not found')
  if (!(existing as SavingsGoal).is_active) {
    return fail('Cannot contribute to an archived goal')
  }

  const current = parseAmount((existing as SavingsGoal).current_amount)
  const next = Math.round((current + parsed.data.amount) * 100) / 100

  const { data, error } = await ctx.supabase
    .from('savings_goals')
    .update({ current_amount: next })
    .eq('id', parsed.data.id)
    .eq('user_id', ctx.userId)
    .select('*')
    .single()

  if (error) {
    console.error('contributeToGoal:', error)
    return fail('Could not log contribution')
  }

  return ok(toGoalView(data as SavingsGoal))
}

export async function archiveGoal(
  id: string
): Promise<ActionResult<SavingsGoalView>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const idParsed = z.string().uuid().safeParse(id)
  if (!idParsed.success) return fail('Invalid goal id')

  const { data: existing, error: loadError } = await ctx.supabase
    .from('savings_goals')
    .select('*')
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('archiveGoal load:', loadError)
    return fail('Could not load goal')
  }
  if (!existing) return fail('Goal not found')

  const row = existing as SavingsGoal
  if (!row.is_active) {
    return ok(toGoalView(row))
  }

  const { data, error } = await ctx.supabase
    .from('savings_goals')
    .update({ is_active: false })
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .select('*')
    .single()

  if (error) {
    console.error('archiveGoal:', error)
    return fail('Could not archive goal')
  }

  return ok(toGoalView(data as SavingsGoal))
}

export async function deleteGoal(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const idParsed = z.string().uuid().safeParse(id)
  if (!idParsed.success) return fail('Invalid goal id')

  const { data: existing, error: loadError } = await ctx.supabase
    .from('savings_goals')
    .select('id')
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('deleteGoal load:', loadError)
    return fail('Could not load goal')
  }
  if (!existing) return fail('Goal not found')

  const { error } = await ctx.supabase
    .from('savings_goals')
    .delete()
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)

  if (error) {
    console.error('deleteGoal:', error)
    return fail('Could not delete goal')
  }

  return ok({ id: idParsed.data })
}

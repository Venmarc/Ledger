'use server'

import { getAuthedContext } from '@/lib/actions/auth-context'
import { fail, ok, type ActionResult } from '@/lib/actions/result'
import type { Category } from '@/lib/types/database'
import {
  createCategorySchema,
  renameCategorySchema,
  type CreateCategoryInput,
  type RenameCategoryInput,
} from '@/lib/validations/category'

const DEFAULT_CATEGORY_SEED: Array<{
  name: string
  type: 'income' | 'expense'
  icon: string
}> = [
  { name: 'Transport', type: 'expense', icon: 'Car' },
  { name: 'Feeding', type: 'expense', icon: 'UtensilsCrossed' },
  { name: 'Rent', type: 'expense', icon: 'Building2' },
  { name: 'Airtime / Data', type: 'expense', icon: 'Smartphone' },
  { name: 'NEPA / Electricity', type: 'expense', icon: 'Zap' },
  { name: 'College / School', type: 'expense', icon: 'GraduationCap' },
  { name: 'Groceries', type: 'expense', icon: 'ShoppingCart' },
  { name: 'Household', type: 'expense', icon: 'House' },
  { name: 'Health', type: 'expense', icon: 'HeartPulse' },
  { name: 'Misc', type: 'expense', icon: 'MoreHorizontal' },
  { name: 'Salary', type: 'income', icon: 'Banknote' },
  { name: 'Freelance', type: 'income', icon: 'Briefcase' },
  { name: 'Gift', type: 'income', icon: 'Gift' },
]

/** Seed 13 SCHEMA defaults if this user has zero categories (e.g. after empty project). */
export async function ensureDefaultCategories(): Promise<ActionResult<Category[]>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const { count, error: countError } = await ctx.supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId)

  if (countError) {
    console.error('ensureDefaultCategories count:', countError)
    return fail('Could not check categories')
  }

  if ((count ?? 0) > 0) {
    return listCategories({ includeArchived: true })
  }

  const rows = DEFAULT_CATEGORY_SEED.map((cat) => ({
    user_id: ctx.userId,
    name: cat.name,
    type: cat.type,
    icon: cat.icon,
    is_default: true,
    is_archived: false,
  }))

  const { error: insertError } = await ctx.supabase.from('categories').insert(rows)

  if (insertError) {
    console.error('ensureDefaultCategories insert:', insertError)
    return fail('Could not seed default categories')
  }

  return listCategories({ includeArchived: true })
}

export async function listCategories(options?: {
  includeArchived?: boolean
}): Promise<ActionResult<Category[]>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  // Auto-seed empty accounts (fresh project / post-resume empty data)
  const { count } = await ctx.supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId)

  if ((count ?? 0) === 0) {
    const seeded = await ensureDefaultCategories()
    if (!seeded.ok) return seeded
    if (!options?.includeArchived) {
      return ok(seeded.data.filter((c) => !c.is_archived))
    }
    return seeded
  }

  let query = ctx.supabase
    .from('categories')
    .select('*')
    .eq('user_id', ctx.userId)
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (!options?.includeArchived) {
    query = query.eq('is_archived', false)
  }

  const { data, error } = await query

  if (error) {
    console.error('listCategories:', error)
    return fail('Could not load categories')
  }

  return ok((data ?? []) as Category[])
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<ActionResult<Category>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = createCategorySchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid category')
  }

  const { name, type, icon } = parsed.data

  // Unique among active categories of same type for this user
  const { data: existing } = await ctx.supabase
    .from('categories')
    .select('id')
    .eq('user_id', ctx.userId)
    .eq('type', type)
    .eq('is_archived', false)
    .ilike('name', name)
    .maybeSingle()

  if (existing) {
    return fail('A category with this name already exists')
  }

  const { data, error } = await ctx.supabase
    .from('categories')
    .insert({
      user_id: ctx.userId,
      name,
      type,
      icon,
      is_default: false,
      is_archived: false,
    })
    .select()
    .single()

  if (error) {
    console.error('createCategory:', error)
    return fail('Could not create category')
  }

  return ok(data as Category)
}

export async function renameCategory(
  input: RenameCategoryInput
): Promise<ActionResult<Category>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = renameCategorySchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid category update')
  }

  const { id, name, icon } = parsed.data

  const { data: current, error: loadError } = await ctx.supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError || !current) {
    return fail('Category not found')
  }

  const { data: clash } = await ctx.supabase
    .from('categories')
    .select('id')
    .eq('user_id', ctx.userId)
    .eq('type', current.type)
    .eq('is_archived', false)
    .ilike('name', name)
    .neq('id', id)
    .maybeSingle()

  if (clash) {
    return fail('A category with this name already exists')
  }

  const patch: Record<string, unknown> = { name }
  if (icon !== undefined) patch.icon = icon

  const { data, error } = await ctx.supabase
    .from('categories')
    .update(patch)
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .select()
    .single()

  if (error) {
    console.error('renameCategory:', error)
    return fail('Could not update category')
  }

  return ok(data as Category)
}

export async function archiveCategory(
  id: string
): Promise<ActionResult<Category>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const { data: current, error: loadError } = await ctx.supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError || !current) {
    return fail('Category not found')
  }

  // PHASES / PAGE_SPECS: defaults not archiveable from UI in v1
  if (current.is_default) {
    return fail('Default categories cannot be archived')
  }

  const { data, error } = await ctx.supabase
    .from('categories')
    .update({ is_archived: true })
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .select()
    .single()

  if (error) {
    console.error('archiveCategory:', error)
    return fail('Could not archive category')
  }

  return ok(data as Category)
}

export async function restoreCategory(
  id: string
): Promise<ActionResult<Category>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const { data: current, error: loadError } = await ctx.supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError || !current) {
    return fail('Category not found')
  }

  const { data: clash } = await ctx.supabase
    .from('categories')
    .select('id')
    .eq('user_id', ctx.userId)
    .eq('type', current.type)
    .eq('is_archived', false)
    .ilike('name', current.name)
    .neq('id', id)
    .maybeSingle()

  if (clash) {
    return fail('An active category with this name already exists')
  }

  const { data, error } = await ctx.supabase
    .from('categories')
    .update({ is_archived: false })
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .select()
    .single()

  if (error) {
    console.error('restoreCategory:', error)
    return fail('Could not restore category')
  }

  return ok(data as Category)
}

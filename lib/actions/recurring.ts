'use server'

import { z } from 'zod'
import { getAuthedContext } from '@/lib/actions/auth-context'
import { fail, ok, type ActionResult } from '@/lib/actions/result'
import { advanceRecurringDate, todayInLagos } from '@/lib/dates'
import type {
  RecurringTemplate,
  RecurringTemplateWithCategory,
  TransactionWithCategory,
} from '@/lib/types/database'
import {
  createRecurringTemplateSchema,
  updateRecurringTemplateSchema,
  type CreateRecurringTemplateInput,
  type UpdateRecurringTemplateInput,
} from '@/lib/validations/recurring'

const CATEGORY_SELECT = `
  id,
  name,
  icon,
  type,
  is_default,
  is_archived
`

const RECURRING_WITH_CATEGORY = `
  *,
  categories ( ${CATEGORY_SELECT} )
`

const TRANSACTION_WITH_CATEGORY = `
  *,
  categories ( ${CATEGORY_SELECT} )
`

function sortByNextDateAsc(
  templates: RecurringTemplateWithCategory[]
): RecurringTemplateWithCategory[] {
  return [...templates].sort((a, b) => a.next_date.localeCompare(b.next_date))
}

/**
 * "All Templates" list per PAGE_SPECS.md PAGE 11: active-but-not-due templates,
 * then inactive templates (dimmed) below. Due templates live only in the
 * Due Now list (`listDueRecurringTemplates`) — not duplicated here.
 */
export async function listRecurringTemplates(): Promise<
  ActionResult<RecurringTemplateWithCategory[]>
> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const { data, error } = await ctx.supabase
    .from('recurring_templates')
    .select(RECURRING_WITH_CATEGORY)
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('listRecurringTemplates:', error)
    return fail('Could not load recurring templates')
  }

  const today = todayInLagos()
  const rows = (data ?? []) as unknown as RecurringTemplateWithCategory[]
  const notDue = rows.filter(
    (row) => !(row.is_active && row.next_date <= today)
  )
  const active = sortByNextDateAsc(notDue.filter((row) => row.is_active))
  const inactive = sortByNextDateAsc(notDue.filter((row) => !row.is_active))

  return ok([...active, ...inactive])
}

/** Due Now list per PAGE_SPECS.md PAGE 11: active templates with next_date <= today. */
export async function listDueRecurringTemplates(): Promise<
  ActionResult<RecurringTemplateWithCategory[]>
> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const today = todayInLagos()

  const { data, error } = await ctx.supabase
    .from('recurring_templates')
    .select(RECURRING_WITH_CATEGORY)
    .eq('user_id', ctx.userId)
    .eq('is_active', true)
    .lte('next_date', today)
    .order('next_date', { ascending: true })

  if (error) {
    console.error('listDueRecurringTemplates:', error)
    return fail('Could not load due recurring templates')
  }

  return ok((data ?? []) as unknown as RecurringTemplateWithCategory[])
}

export async function createRecurringTemplate(
  input: CreateRecurringTemplateInput
): Promise<ActionResult<RecurringTemplateWithCategory>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = createRecurringTemplateSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid recurring template')
  }

  const { data: cat, error: catError } = await ctx.supabase
    .from('categories')
    .select(CATEGORY_SELECT)
    .eq('id', parsed.data.category_id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (catError) {
    console.error('createRecurringTemplate category:', catError)
    return fail('Could not verify category')
  }
  if (!cat) return fail('Category not found')
  if (cat.is_archived) return fail('Category is archived')
  if (cat.type !== parsed.data.type) {
    return fail(`Category must be a ${parsed.data.type} category`)
  }

  const { data, error } = await ctx.supabase
    .from('recurring_templates')
    .insert({
      user_id: ctx.userId,
      category_id: parsed.data.category_id,
      type: parsed.data.type,
      description: parsed.data.description,
      amount: parsed.data.amount,
      frequency: parsed.data.frequency,
      next_date: parsed.data.next_date,
      is_active: true,
    })
    .select(RECURRING_WITH_CATEGORY)
    .single()

  if (error) {
    console.error('createRecurringTemplate:', error)
    return fail('Could not create recurring template')
  }

  return ok(data as unknown as RecurringTemplateWithCategory)
}

export async function updateRecurringTemplate(
  input: UpdateRecurringTemplateInput
): Promise<ActionResult<RecurringTemplateWithCategory>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const parsed = updateRecurringTemplateSchema.safeParse(input)
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid update')
  }

  const { id, ...rest } = parsed.data
  if (Object.keys(rest).length === 0) {
    return fail('No changes to save')
  }

  const { data: existing, error: loadError } = await ctx.supabase
    .from('recurring_templates')
    .select('*')
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('updateRecurringTemplate load:', loadError)
    return fail('Could not load recurring template')
  }
  if (!existing) return fail('Recurring template not found')

  const existingTemplate = existing as RecurringTemplate

  if (rest.category_id !== undefined || rest.type !== undefined) {
    const finalCategoryId = rest.category_id ?? existingTemplate.category_id
    const finalType = rest.type ?? existingTemplate.type

    const { data: cat, error: catError } = await ctx.supabase
      .from('categories')
      .select(CATEGORY_SELECT)
      .eq('id', finalCategoryId)
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (catError) {
      console.error('updateRecurringTemplate category:', catError)
      return fail('Could not verify category')
    }
    if (!cat) return fail('Category not found')
    if (cat.is_archived) return fail('Category is archived')
    if (cat.type !== finalType) {
      return fail(`Category must be a ${finalType} category`)
    }
  }

  const patch: Record<string, unknown> = {}
  if (rest.category_id !== undefined) patch.category_id = rest.category_id
  if (rest.type !== undefined) patch.type = rest.type
  if (rest.description !== undefined) patch.description = rest.description
  if (rest.amount !== undefined) patch.amount = rest.amount
  if (rest.frequency !== undefined) patch.frequency = rest.frequency
  if (rest.next_date !== undefined) patch.next_date = rest.next_date
  if (rest.is_active !== undefined) patch.is_active = rest.is_active

  const { data, error } = await ctx.supabase
    .from('recurring_templates')
    .update(patch)
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .select(RECURRING_WITH_CATEGORY)
    .single()

  if (error) {
    console.error('updateRecurringTemplate:', error)
    return fail('Could not update recurring template')
  }

  return ok(data as unknown as RecurringTemplateWithCategory)
}

export async function deleteRecurringTemplate(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const idParsed = z.string().uuid().safeParse(id)
  if (!idParsed.success) return fail('Invalid recurring template id')

  const { data: existing, error: loadError } = await ctx.supabase
    .from('recurring_templates')
    .select('id')
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('deleteRecurringTemplate load:', loadError)
    return fail('Could not load recurring template')
  }
  if (!existing) return fail('Recurring template not found')

  const { error } = await ctx.supabase
    .from('recurring_templates')
    .delete()
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)

  if (error) {
    console.error('deleteRecurringTemplate:', error)
    return fail('Could not delete recurring template')
  }

  return ok({ id: idParsed.data })
}

export type ConfirmRecurringResult = {
  template: RecurringTemplateWithCategory
  transaction: TransactionWithCategory
}

export async function confirmRecurringTemplate(
  id: string
): Promise<ActionResult<ConfirmRecurringResult>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const idParsed = z.string().uuid().safeParse(id)
  if (!idParsed.success) return fail('Invalid recurring template id')

  const { data: existing, error: loadError } = await ctx.supabase
    .from('recurring_templates')
    .select('*')
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('confirmRecurringTemplate load:', loadError)
    return fail('Could not load recurring template')
  }
  if (!existing) return fail('Recurring template not found')

  const template = existing as RecurringTemplate
  if (!template.is_active) return fail('Recurring template is not active')
  if (template.next_date > todayInLagos()) {
    return fail('Recurring template is not due yet')
  }

  const { data: txData, error: txError } = await ctx.supabase
    .from('transactions')
    .insert({
      user_id: ctx.userId,
      category_id: template.category_id,
      amount: template.amount,
      type: template.type,
      transaction_date: todayInLagos(),
      description: template.description,
      notes: null,
      payment_method: null,
      tags: null,
      recurring_id: template.id,
    })
    .select(TRANSACTION_WITH_CATEGORY)
    .single()

  if (txError) {
    console.error('confirmRecurringTemplate transaction insert:', txError)
    return fail('Could not create transaction')
  }

  const nextDate = advanceRecurringDate(template.next_date, template.frequency)

  const { data: templateData, error: updateError } = await ctx.supabase
    .from('recurring_templates')
    .update({ next_date: nextDate })
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .select(RECURRING_WITH_CATEGORY)
    .single()

  if (updateError) {
    console.error('confirmRecurringTemplate template update:', updateError)
    return fail(
      'Transaction was created, but the recurring template date could not be advanced'
    )
  }

  return ok({
    template: templateData as unknown as RecurringTemplateWithCategory,
    transaction: txData as unknown as TransactionWithCategory,
  })
}

export async function skipRecurringTemplate(
  id: string
): Promise<ActionResult<RecurringTemplateWithCategory>> {
  const ctx = await getAuthedContext()
  if (!ctx.ok) return fail(ctx.error)

  const idParsed = z.string().uuid().safeParse(id)
  if (!idParsed.success) return fail('Invalid recurring template id')

  const { data: existing, error: loadError } = await ctx.supabase
    .from('recurring_templates')
    .select('*')
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .maybeSingle()

  if (loadError) {
    console.error('skipRecurringTemplate load:', loadError)
    return fail('Could not load recurring template')
  }
  if (!existing) return fail('Recurring template not found')

  const template = existing as RecurringTemplate
  if (!template.is_active) return fail('Recurring template is not active')
  if (template.next_date > todayInLagos()) {
    return fail('Recurring template is not due yet')
  }

  const nextDate = advanceRecurringDate(template.next_date, template.frequency)

  const { data, error } = await ctx.supabase
    .from('recurring_templates')
    .update({ next_date: nextDate })
    .eq('id', idParsed.data)
    .eq('user_id', ctx.userId)
    .select(RECURRING_WITH_CATEGORY)
    .single()

  if (error) {
    console.error('skipRecurringTemplate:', error)
    return fail('Could not skip recurring template')
  }

  return ok(data as unknown as RecurringTemplateWithCategory)
}

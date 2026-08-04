import { z } from 'zod'

const amountSchema = z
  .union([z.string(), z.number()])
  .transform((v) =>
    typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''))
  )
  .refine((n) => Number.isFinite(n) && n > 0, {
    message: 'Amount must be greater than 0',
  })
  .transform((n) => Math.round(n * 100) / 100)

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')

export const recurringFrequencySchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'yearly',
])

export const createRecurringTemplateSchema = z.object({
  category_id: z.string().uuid('Category is required'),
  type: z.enum(['income', 'expense']),
  description: z.string().trim().min(1, 'Description is required').max(200),
  amount: amountSchema,
  frequency: recurringFrequencySchema,
  next_date: dateStringSchema,
})

export const updateRecurringTemplateSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid().optional(),
  type: z.enum(['income', 'expense']).optional(),
  description: z.string().trim().min(1, 'Description is required').max(200).optional(),
  amount: amountSchema.optional(),
  frequency: recurringFrequencySchema.optional(),
  next_date: dateStringSchema.optional(),
  is_active: z.boolean().optional(),
})

export type CreateRecurringTemplateInput = z.infer<
  typeof createRecurringTemplateSchema
>
export type UpdateRecurringTemplateInput = z.infer<
  typeof updateRecurringTemplateSchema
>

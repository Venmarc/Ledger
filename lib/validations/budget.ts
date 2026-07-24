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

/** Month as YYYY-MM or YYYY-MM-DD; normalized to first day of month. */
const monthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Month must be YYYY-MM or YYYY-MM-DD')
  .transform((s) => (s.length === 7 ? `${s}-01` : s))
  .refine((s) => s.endsWith('-01'), {
    message: 'Month must be the first day of the month',
  })

export const createBudgetSchema = z.object({
  category_id: z.string().uuid('Category is required'),
  month: monthSchema,
  amount: amountSchema,
  period: z.literal('monthly').default('monthly'),
})

export const updateBudgetSchema = z.object({
  id: z.string().uuid(),
  amount: amountSchema,
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>

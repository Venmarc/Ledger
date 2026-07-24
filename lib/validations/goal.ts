import { z } from 'zod'

const positiveAmountSchema = z
  .union([z.string(), z.number()])
  .transform((v) =>
    typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''))
  )
  .refine((n) => Number.isFinite(n) && n > 0, {
    message: 'Amount must be greater than 0',
  })
  .transform((n) => Math.round(n * 100) / 100)

const nonNegativeAmountSchema = z
  .union([z.string(), z.number()])
  .transform((v) =>
    typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''))
  )
  .refine((n) => Number.isFinite(n) && n >= 0, {
    message: 'Amount must be zero or greater',
  })
  .transform((n) => Math.round(n * 100) / 100)

const optionalDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
  .optional()
  .nullable()

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(80),
  description: z.string().trim().max(500).optional().nullable(),
  target_amount: positiveAmountSchema,
  current_amount: nonNegativeAmountSchema.optional().default(0),
  target_date: optionalDateSchema,
})

export const updateGoalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  target_amount: positiveAmountSchema.optional(),
  target_date: optionalDateSchema,
})

export const contributeGoalSchema = z.object({
  id: z.string().uuid(),
  amount: positiveAmountSchema,
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
export type ContributeGoalInput = z.infer<typeof contributeGoalSchema>

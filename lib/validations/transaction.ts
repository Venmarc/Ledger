import { z } from 'zod'

export const paymentMethodSchema = z.enum([
  'Cash',
  'Card',
  'Transfer',
  'POS',
  'Other',
])

export const transactionTypeSchema = z.enum(['income', 'expense'])

const amountSchema = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'number' ? v : parseFloat(v.replace(/,/g, ''))))
  .refine((n) => Number.isFinite(n) && n > 0, {
    message: 'Amount must be greater than 0',
  })
  .transform((n) => Math.round(n * 100) / 100)

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')

export const createTransactionSchema = z.object({
  amount: amountSchema,
  type: transactionTypeSchema,
  category_id: z.string().uuid('Category is required'),
  transaction_date: dateStringSchema,
  description: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  payment_method: paymentMethodSchema.optional().nullable(),
  tags: z.array(z.string().max(40)).max(20).optional().nullable(),
  recurring_id: z.string().uuid().optional().nullable(),
})

export const updateTransactionSchema = createTransactionSchema.partial().extend({
  id: z.string().uuid(),
})

export const restoreTransactionSchema = createTransactionSchema.extend({
  id: z.string().uuid(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type RestoreTransactionInput = z.infer<typeof restoreTransactionSchema>

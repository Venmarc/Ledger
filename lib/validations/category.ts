import { z } from 'zod'
import { transactionTypeSchema } from './transaction'

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  type: transactionTypeSchema,
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex value')
    .default('#3b82f6'),
  icon: z.string().max(40).optional().nullable(),
})

export const renameCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, 'Name is required').max(60),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  icon: z.string().max(40).optional().nullable(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type RenameCategoryInput = z.infer<typeof renameCategorySchema>

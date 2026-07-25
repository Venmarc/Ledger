import { z } from 'zod'
import { transactionTypeSchema } from './transaction'

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  type: transactionTypeSchema,
  icon: z.string().min(1, 'Icon is required').max(60),
})

export const renameCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, 'Name is required').max(60),
  icon: z.string().min(1, 'Icon is required').max(60).optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type RenameCategoryInput = z.infer<typeof renameCategorySchema>

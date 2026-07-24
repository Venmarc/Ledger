/** Domain types aligned with SCHEMA.md (Clerk user_id is text, money is numeric). */

export type TransactionType = 'income' | 'expense'

export type PaymentMethod = 'Cash' | 'Card' | 'Transfer' | 'POS' | 'Other'

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Card',
  'Transfer',
  'POS',
  'Other',
]

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  base_currency: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: TransactionType
  color: string
  icon: string | null
  is_default: boolean
  is_archived: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string
  /** Postgres numeric(15,2) arrives as string via PostgREST */
  amount: string
  type: TransactionType
  transaction_date: string
  description: string | null
  notes: string | null
  payment_method: PaymentMethod | null
  tags: string[] | null
  recurring_id: string | null
  created_at: string
  updated_at: string
}

export type CategorySummary = Pick<
  Category,
  'id' | 'name' | 'color' | 'icon' | 'type' | 'is_default' | 'is_archived'
>

export interface TransactionWithCategory extends Transaction {
  categories: CategorySummary | null
}

export interface MonthSummary {
  income: number
  expense: number
  balance: number
  /** expense / income; 0 when income is 0 */
  expenseRatio: number
}

export type DateRangePreset =
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'this_year'
  | 'custom'

export interface TransactionListFilters {
  dateRange: DateRangePreset
  customFrom: string | null
  customTo: string | null
  type: 'all' | TransactionType
  categoryIds: string[]
  paymentMethod: PaymentMethod | 'all'
  search: string
}

export interface QuickAddDraft {
  amount: string
  type: TransactionType
  category_id: string | null
  payment_method: PaymentMethod | null
  description: string
  notes: string
  tags: string[]
  transaction_date: string
  /** True after any field is edited; drives draft restore UX */
  isDirty: boolean
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionListFilters = {
  dateRange: 'this_month',
  customFrom: null,
  customTo: null,
  type: 'all',
  categoryIds: [],
  paymentMethod: 'all',
  search: '',
}

export function createEmptyQuickAddDraft(
  transactionDate: string
): QuickAddDraft {
  return {
    amount: '',
    type: 'expense',
    category_id: null,
    payment_method: null,
    description: '',
    notes: '',
    tags: [],
    transaction_date: transactionDate,
    isDirty: false,
  }
}

/** Row shape for public.budgets (SCHEMA.md). amount is PostgREST string. */
export interface Budget {
  id: string
  user_id: string
  category_id: string
  period: 'monthly'
  /** First day of month YYYY-MM-DD */
  month: string
  amount: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Budget + query-time actuals + joined category for cards. */
export interface BudgetWithActual extends Budget {
  /** Sum of expense transactions for category in month (number for math). */
  actual: number
  /** amount as number */
  limit: number
  /** actual / limit; Infinity if limit is 0 (should not happen). */
  ratio: number
  categories: CategorySummary | null
}

export interface BudgetMonthSummary {
  totalBudgeted: number
  totalSpent: number
  remaining: number
}

/** Row shape for public.savings_goals. */
export interface SavingsGoal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_amount: string
  current_amount: string
  target_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Derived flags for list/detail UI (not DB columns). */
export interface SavingsGoalView extends SavingsGoal {
  current: number
  target: number
  ratio: number
  /** current >= target */
  isCompleted: boolean
}

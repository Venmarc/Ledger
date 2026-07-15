import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const defaultCategories = [
  { name: 'Transport', type: 'expense', color: '#ef4444', icon: 'Car' },
  { name: 'Feeding', type: 'expense', color: '#f59e0b', icon: 'Utensils' },
  { name: 'Rent', type: 'expense', color: '#10b981', icon: 'Home' },
  { name: 'Airtime / Data', type: 'expense', color: '#3b82f6', icon: 'Wifi' },
  { name: 'NEPA / Electricity', type: 'expense', color: '#6366f1', icon: 'Zap' },
  { name: 'College / School', type: 'expense', color: '#8b5cf6', icon: 'GraduationCap' },
  { name: 'Groceries', type: 'expense', color: '#ec4899', icon: 'ShoppingBag' },
  { name: 'Household', type: 'expense', color: '#14b8a6', icon: 'Package' },
  { name: 'Health', type: 'expense', color: '#f43f5e', icon: 'HeartPulse' },
  { name: 'Misc', type: 'expense', color: '#6b7280', icon: 'FolderArchive' },
  { name: 'Salary', type: 'income', color: '#22c55e', icon: 'Briefcase' },
  { name: 'Freelance', type: 'income', color: '#10b981', icon: 'Laptop' },
  { name: 'Gift', type: 'income', color: '#eab308', icon: 'Gift' },
]

async function seedCategories(userId: string) {
  console.log(`Seeding categories for user: ${userId}`)
  
  const records = defaultCategories.map(cat => ({
    user_id: userId,
    name: cat.name,
    type: cat.type,
    color: cat.color,
    icon: cat.icon,
    is_default: true,
    is_archived: false
  }))

  const { data, error } = await supabase
    .from('categories')
    .insert(records)
    .select()

  if (error) {
    console.error('Error seeding categories:', error)
  } else {
    console.log(`Successfully seeded ${data.length} categories!`)
  }
}

const targetUserId = process.argv[2]
if (!targetUserId) {
  console.error('Please specify a Clerk User ID as an argument. Usage: npx tsx scripts/seed_categories.ts user_2abc...')
  process.exit(1)
}

seedCategories(targetUserId)

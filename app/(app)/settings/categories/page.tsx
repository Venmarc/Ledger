import type { Metadata } from 'next'
import { CategoriesManager } from '@/components/categories/categories-manager'

export const metadata: Metadata = {
  title: 'Categories',
}

export default function SettingsCategoriesPage() {
  return <CategoriesManager />
}

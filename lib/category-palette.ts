/**
 * 12-color category picker palette (PAGE_SPECS / UIUX chart accents).
 * Values are stored on categories.color in the database.
 */
export const CATEGORY_PALETTE = [
  '#38BDF8', // azure
  '#F97316', // orange
  '#22C55E', // green
  '#A78BFA', // violet
  '#FB923C', // light orange
  '#34D399', // emerald
  '#F472B6', // pink
  '#60A5FA', // blue
  '#FBBF24', // amber (category identity only — not budget warning)
  '#2DD4BF', // teal
  '#E879F9', // fuchsia
  '#94A3B8', // slate
] as const

export type CategoryPaletteColor = (typeof CATEGORY_PALETTE)[number]

export const DEFAULT_CATEGORY_COLOR: CategoryPaletteColor = '#38BDF8'

/** Optional Lucide icon names stored in categories.icon */
export const CATEGORY_ICON_OPTIONS = [
  { id: 'circle', label: 'General' },
  { id: 'car', label: 'Transport' },
  { id: 'utensils', label: 'Food' },
  { id: 'home', label: 'Home' },
  { id: 'smartphone', label: 'Data' },
  { id: 'zap', label: 'Power' },
  { id: 'graduation-cap', label: 'School' },
  { id: 'shopping-cart', label: 'Shop' },
  { id: 'heart-pulse', label: 'Health' },
  { id: 'briefcase', label: 'Work' },
  { id: 'gift', label: 'Gift' },
  { id: 'wallet', label: 'Money' },
] as const

import {
  Smartphone,
  GraduationCap,
  UtensilsCrossed,
  ShoppingCart,
  HeartPulse,
  House,
  MoreHorizontal,
  Zap,
  Building2,
  Car,
  Briefcase,
  Gift,
  Banknote,
  MonitorPlay,
  Fuel,
  Wifi,
  Dumbbell,
  ShieldCheck,
  Popcorn,
  Sparkles,
  Shirt,
  Landmark,
  Wrench,
  Plane,
  Coffee,
  CircleDot,
  Award,
  Store,
  TrendingUp,
  CornerDownLeft,
  HandCoins,
  Rocket,
  Percent,
  type LucideIcon,
} from 'lucide-react'

export interface IconOption {
  name: string
  label: string
  icon: LucideIcon
}

export const DEFAULT_EXPENSE_ICONS: IconOption[] = [
  { name: 'Smartphone', label: 'Airtime / Data', icon: Smartphone },
  { name: 'GraduationCap', label: 'College / School', icon: GraduationCap },
  { name: 'UtensilsCrossed', label: 'Feeding', icon: UtensilsCrossed },
  { name: 'ShoppingCart', label: 'Groceries', icon: ShoppingCart },
  { name: 'HeartPulse', label: 'Health', icon: HeartPulse },
  { name: 'House', label: 'Household', icon: House },
  { name: 'MoreHorizontal', label: 'Misc', icon: MoreHorizontal },
  { name: 'Zap', label: 'NEPA / Electricity', icon: Zap },
  { name: 'Building2', label: 'Rent', icon: Building2 },
  { name: 'Car', label: 'Transport', icon: Car },
]

export const DEFAULT_INCOME_ICONS: IconOption[] = [
  { name: 'Briefcase', label: 'Freelance', icon: Briefcase },
  { name: 'Gift', label: 'Gift', icon: Gift },
  { name: 'Banknote', label: 'Salary', icon: Banknote },
]

export const CURATED_EXPENSE_ICONS: IconOption[] = [
  { name: 'MonitorPlay', label: 'Subscriptions', icon: MonitorPlay },
  { name: 'Fuel', label: 'Fuel', icon: Fuel },
  { name: 'Wifi', label: 'Internet / WiFi', icon: Wifi },
  { name: 'Dumbbell', label: 'Fitness / Gym', icon: Dumbbell },
  { name: 'ShieldCheck', label: 'Insurance', icon: ShieldCheck },
  { name: 'Popcorn', label: 'Entertainment', icon: Popcorn },
  { name: 'Sparkles', label: 'Personal Care', icon: Sparkles },
  { name: 'Shirt', label: 'Clothing', icon: Shirt },
  { name: 'Landmark', label: 'Debt / Loan', icon: Landmark },
  { name: 'Briefcase', label: 'Business', icon: Briefcase },
  { name: 'Wrench', label: 'Repairs', icon: Wrench },
  { name: 'Plane', label: 'Travel', icon: Plane },
  { name: 'Coffee', label: 'Dining Out', icon: Coffee },
  { name: 'CircleDot', label: 'General', icon: CircleDot },
]

export const CURATED_INCOME_ICONS: IconOption[] = [
  { name: 'Award', label: 'Bonus', icon: Award },
  { name: 'Store', label: 'Business Income', icon: Store },
  { name: 'TrendingUp', label: 'Investment', icon: TrendingUp },
  { name: 'CornerDownLeft', label: 'Refund', icon: CornerDownLeft },
  { name: 'HandCoins', label: 'Loan Received', icon: HandCoins },
  { name: 'Rocket', label: 'Side Hustle', icon: Rocket },
  { name: 'Percent', label: 'Cashback', icon: Percent },
  { name: 'CircleDot', label: 'Other', icon: CircleDot },
]

const ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  GraduationCap,
  UtensilsCrossed,
  ShoppingCart,
  HeartPulse,
  House,
  MoreHorizontal,
  Zap,
  Building2,
  Car,
  Briefcase,
  Gift,
  Banknote,
  MonitorPlay,
  Fuel,
  Wifi,
  Dumbbell,
  ShieldCheck,
  Popcorn,
  Sparkles,
  Shirt,
  Landmark,
  Wrench,
  Plane,
  Coffee,
  CircleDot,
  Award,
  Store,
  TrendingUp,
  CornerDownLeft,
  HandCoins,
  Rocket,
  Percent,
  // Legacy / lower-case fallbacks
  car: Car,
  utensils: UtensilsCrossed,
  home: House,
  smartphone: Smartphone,
  zap: Zap,
  'graduation-cap': GraduationCap,
  'shopping-cart': ShoppingCart,
  'heart-pulse': HeartPulse,
  circle: CircleDot,
  wallet: Banknote,
}

export function getCategoryIconComponent(name: string | null | undefined): LucideIcon {
  if (!name) return CircleDot
  return ICON_MAP[name] || CircleDot
}

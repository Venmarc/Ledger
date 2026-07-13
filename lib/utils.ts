import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNGN(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  const parsedValue = isNaN(value) ? 0 : value
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsedValue)
}

'use client'

import { useUser } from '@clerk/nextjs'
import { LAGOS_TZ } from '@/lib/dates'
import { MonthSelector } from '@/components/dashboard/month-selector'

function greetingWord(now = new Date()): string {
  const hourStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: LAGOS_TZ,
    hour: 'numeric',
    hour12: false,
  }).format(now)
  const hour = parseInt(hourStr, 10)
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

type Props = {
  monthKey: string
  onMonthChange: (monthKey: string) => void
}

/**
 * Stack greeting + month until lg so tablet + sidebar never crush the title
 * into the month pill (audit P0 ~768–922).
 */
export function DashboardHeader({ monthKey, onMonthChange }: Props) {
  const { user, isLoaded } = useUser()
  const firstName =
    user?.firstName ||
    user?.fullName?.split(' ')[0] ||
    user?.username ||
    'there'

  return (
    <header className="flex flex-col items-start gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
      <div className="min-w-0 w-full lg:flex-1">
        <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
          {isLoaded
            ? `Good ${greetingWord()}, ${firstName}`
            : 'Dashboard'}
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Your NGN overview at a glance.
        </p>
      </div>
      {/* w-fit via MonthSelector; never flex-grow into the title */}
      <MonthSelector
        monthKey={monthKey}
        onChange={onMonthChange}
        className="shrink-0 self-start"
      />
    </header>
  )
}

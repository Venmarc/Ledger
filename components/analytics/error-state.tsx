import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ErrorStateProps = {
  message: string
  onRetry: () => void
  className?: string
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-red/40 bg-red-muted px-4 py-6 text-center',
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-red" aria-hidden />
      <p className="mt-2 text-sm text-red">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-3 min-h-11 text-sm font-semibold text-azure cursor-pointer"
      >
        Retry
      </button>
    </div>
  )
}

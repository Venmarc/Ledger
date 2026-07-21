import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

export function Field({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...props} />
  )
}

export function FieldLabel({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<typeof Label> & { required?: boolean }) {
  return (
    <Label
      className={cn(
        'text-sm font-medium text-text-secondary',
        className
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-red ml-0.5" aria-hidden>
          *
        </span>
      ) : null}
    </Label>
  )
}

export function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  if (!children) return null
  return (
    <p
      role="alert"
      className={cn('text-xs text-red', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function FieldHint({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-xs text-text-tertiary', className)} {...props} />
  )
}

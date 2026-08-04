'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { DueRow } from '@/components/recurring/due-row'
import { TemplateRow } from '@/components/recurring/template-row'
import {
  RecurringFormSheet,
  type RecurringFormMode,
} from '@/components/recurring/recurring-form-sheet'
import { RecurringListSkeleton } from '@/components/recurring/skeletons'
import { SecondaryButton } from '@/components/transactions'
import {
  useConfirmRecurringTemplate,
  useDueRecurringTemplates,
  useRecurringTemplates,
  useSkipRecurringTemplate,
  useUpdateRecurringTemplate,
} from '@/lib/hooks/use-recurring'
import type { RecurringTemplateWithCategory } from '@/lib/types/database'

export function RecurringView() {
  const {
    data: dueData,
    isLoading: dueLoading,
    isError: dueIsError,
  } = useDueRecurringTemplates()
  const {
    data: templatesData,
    isLoading: templatesLoading,
    isError: templatesIsError,
    error: templatesError,
    refetch: refetchTemplates,
  } = useRecurringTemplates()

  const confirmMutation = useConfirmRecurringTemplate()
  const skipMutation = useSkipRecurringTemplate()
  const toggleMutation = useUpdateRecurringTemplate()

  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const [pendingAction, setPendingAction] = React.useState<
    'confirm' | 'skip' | null
  >(null)

  const [formMode, setFormMode] = React.useState<RecurringFormMode | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)

  const due = dueData ?? []
  const templates = templatesData ?? []
  const activeCount = templates.filter((t) => t.is_active).length + due.length

  const openCreate = () => {
    setFormMode({ kind: 'create' })
    setFormOpen(true)
  }

  const openEdit = (template: RecurringTemplateWithCategory) => {
    setFormMode({ kind: 'edit', template })
    setFormOpen(true)
  }

  const handleConfirm = async (template: RecurringTemplateWithCategory) => {
    setPendingId(template.id)
    setPendingAction('confirm')
    try {
      await confirmMutation.mutateAsync(template.id)
      toast.success('Transaction logged')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not confirm recurring template'
      )
    } finally {
      setPendingId(null)
      setPendingAction(null)
    }
  }

  const handleSkip = async (template: RecurringTemplateWithCategory) => {
    setPendingId(template.id)
    setPendingAction('skip')
    try {
      await skipMutation.mutateAsync(template.id)
      toast.success('Skipped')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not skip recurring template'
      )
    } finally {
      setPendingId(null)
      setPendingAction(null)
    }
  }

  const handleToggleActive = async (
    template: RecurringTemplateWithCategory,
    active: boolean
  ) => {
    setPendingId(template.id)
    try {
      await toggleMutation.mutateAsync({ id: template.id, is_active: active })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not update recurring template'
      )
    } finally {
      setPendingId(null)
    }
  }

  const isLoading = dueLoading || templatesLoading
  const isError = dueIsError || templatesIsError
  const isEmpty = !isLoading && due.length === 0 && templates.length === 0

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
          Recurring
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          {activeCount} active {activeCount === 1 ? 'template' : 'templates'}
        </p>
      </header>

      {isLoading ? <RecurringListSkeleton /> : null}

      {isError && !isLoading ? (
        <div className="rounded-xl border border-red/40 bg-red-muted px-4 py-6 text-center">
          <p className="text-sm text-red">
            {templatesError instanceof Error
              ? templatesError.message
              : 'Could not load recurring templates. Retry.'}
          </p>
          <button
            type="button"
            onClick={() => void refetchTemplates()}
            className="mt-3 min-h-11 text-sm font-semibold text-azure cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <>
          {due.length > 0 ? (
            <section className="entrance-blur-in space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                <span
                  className="h-2 w-2 rounded-full bg-amber"
                  aria-hidden
                />
                Due Now
              </h2>
              <div className="entrance-stagger space-y-3">
                {due.map((t) => (
                  <DueRow
                    key={t.id}
                    template={t}
                    onConfirm={() => void handleConfirm(t)}
                    onSkip={() => void handleSkip(t)}
                    confirmLoading={pendingId === t.id && pendingAction === 'confirm'}
                    skipLoading={pendingId === t.id && pendingAction === 'skip'}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {isEmpty ? (
            <div className="entrance-blur-in rounded-xl border border-dashed border-border bg-bg-surface/50 px-4 py-10 text-center">
              <p className="text-sm text-text-secondary">
                No recurring templates. Add one to get started.
              </p>
            </div>
          ) : (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
                All Templates
              </h2>
              {templates.length === 0 ? (
                <p className="px-1 text-sm text-text-secondary">
                  No other templates.
                </p>
              ) : (
                <div className="entrance-stagger space-y-2">
                  {templates.map((t) => (
                    <TemplateRow
                      key={t.id}
                      template={t}
                      onEdit={() => openEdit(t)}
                      onToggleActive={(active) =>
                        void handleToggleActive(t, active)
                      }
                      toggleLoading={pendingId === t.id}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          <SecondaryButton type="button" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            New Recurring
          </SecondaryButton>
        </>
      ) : null}

      <RecurringFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setFormMode(null)
        }}
        mode={formMode}
      />
    </div>
  )
}

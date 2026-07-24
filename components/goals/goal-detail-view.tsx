'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { GoalDetailSkeleton } from '@/components/goals/skeletons'
import { ContributeSheet } from '@/components/goals/contribute-sheet'
import { ProgressRing } from '@/components/shared/progress-ring'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import {
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
} from '@/components/transactions/primary-button'
import { useGoal, useArchiveGoal, useDeleteGoal } from '@/lib/hooks/use-goals'
import { formatNGN } from '@/lib/utils'
import { formatGoalTargetLabel } from '@/lib/dates'

export function GoalDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: goal, isLoading, isError, error, refetch } = useGoal(id)
  const archiveMutation = useArchiveGoal()
  const deleteMutation = useDeleteGoal()

  const [contributeOpen, setContributeOpen] = React.useState(false)
  const [confirmArchive, setConfirmArchive] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  if (isLoading) {
    return <GoalDetailSkeleton />
  }

  if (isError || !goal) {
    return (
      <div className="space-y-4 text-center">
        <Link
          href="/goals"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Goals
        </Link>
        <div className="rounded-xl border border-red/40 bg-red-muted px-4 py-8">
          <p className="text-sm font-medium text-red">
            {error instanceof Error ? error.message : 'Goal not found.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 min-h-11 cursor-pointer text-sm font-semibold text-azure"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const targetLabel = formatGoalTargetLabel(goal.target_date)
  const remaining = Math.max(0, goal.target - goal.current)

  const handleMarkComplete = async () => {
    try {
      await archiveMutation.mutateAsync(goal.id)
      toast.success('Goal marked as complete!')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not mark goal complete'
      )
    }
  }

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(goal.id)
      toast.success('Goal archived')
      setConfirmArchive(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not archive goal'
      )
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(goal.id)
      toast.success('Goal deleted')
      setConfirmDelete(false)
      router.push('/goals')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not delete goal'
      )
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
            {goal.title}
          </h1>
          {!goal.is_active ? (
            <span className="rounded-full bg-bg-subtle px-2.5 py-0.5 text-xs font-medium text-text-tertiary">
              Archived
            </span>
          ) : goal.isCompleted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-muted px-2.5 py-0.5 text-xs font-medium text-green">
              <CheckCircle className="h-3.5 w-3.5" aria-hidden />
              Target Reached
            </span>
          ) : null}
        </div>
        {goal.description ? (
          <p className="text-sm text-text-secondary">{goal.description}</p>
        ) : null}
        {targetLabel ? (
          <p className="text-xs font-medium text-text-tertiary">
            {targetLabel.text}
          </p>
        ) : null}
      </div>

      <div className="my-6 flex justify-center py-4">
        <ProgressRing ratio={goal.ratio} size={160} labelSize="lg" />
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-bg-surface p-4 text-center shadow-card">
        <div>
          <p className="text-xs text-text-tertiary">Saved</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary md:text-base">
            {formatNGN(goal.current)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary">Target</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary md:text-base">
            {formatNGN(goal.target)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary">Remaining</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary md:text-base">
            {formatNGN(remaining)}
          </p>
        </div>
      </div>

      {goal.is_active ? (
        <PrimaryButton
          type="button"
          onClick={() => setContributeOpen(true)}
          className="w-full"
        >
          + Log Contribution
        </PrimaryButton>
      ) : null}

      <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-card">
        <h2 className="text-sm font-semibold text-text-primary">
          Contribution History
        </h2>
        <p className="mt-2 text-sm tabular-nums text-text-secondary">
          {formatNGN(goal.current)} contributed total.
        </p>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        {goal.is_active && goal.isCompleted ? (
          <SecondaryButton
            type="button"
            onClick={() => void handleMarkComplete()}
            disabled={archiveMutation.isPending}
            className="w-full"
          >
            Mark as Complete
          </SecondaryButton>
        ) : null}

        {goal.is_active && !goal.isCompleted ? (
          <SecondaryButton
            type="button"
            onClick={() => setConfirmArchive(true)}
            disabled={archiveMutation.isPending || deleteMutation.isPending}
            className="w-full"
          >
            Archive Goal
          </SecondaryButton>
        ) : null}

        <DestructiveButton
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={archiveMutation.isPending || deleteMutation.isPending}
          className="w-full"
        >
          Delete Goal
        </DestructiveButton>
      </div>

      <ContributeSheet
        open={contributeOpen}
        onOpenChange={setContributeOpen}
        goalId={goal.id}
        goalTitle={goal.title}
      />

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title="Archive goal?"
        description="This goal will be moved to the Completed/Archived section on your Goals list. You can no longer log contributions to it."
        confirmLabel="Archive Goal"
        variant="default"
        loading={archiveMutation.isPending}
        onConfirm={() => void handleArchive()}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete goal?"
        description="Are you sure you want to delete this goal? This action cannot be undone."
        confirmLabel="Delete Goal"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}

import type { Metadata } from 'next'
import { GoalDetailView } from '@/components/goals/goal-detail-view'

export const metadata: Metadata = {
  title: 'Goals',
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <GoalDetailView id={id} />
}
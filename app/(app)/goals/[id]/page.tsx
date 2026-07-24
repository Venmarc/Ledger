'use client'

import { use } from 'react'
import { GoalDetailView } from '@/components/goals/goal-detail-view'

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <GoalDetailView id={id} />
}

'use client'

import { use } from 'react'
import { TransactionFormCard } from '@/components/transactions/transaction-form-card'

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <div className="py-2 md:py-6">
      <TransactionFormCard key={id} id={id} />
    </div>
  )
}

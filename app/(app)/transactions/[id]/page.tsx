import type { Metadata } from 'next'
import { TransactionFormCard } from '@/components/transactions/transaction-form-card'

export const metadata: Metadata = {
  title: 'Transactions',
}

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="py-2 md:py-6">
      <TransactionFormCard key={id} id={id} />
    </div>
  )
}
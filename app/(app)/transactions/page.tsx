'use client'

import { TransactionFilterBar } from '@/components/transactions/filter-bar'
import {
  TransactionList,
  TransactionListHeader,
} from '@/components/transactions/transaction-list'

export default function TransactionsPage() {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="entrance-blur-in">
        <TransactionListHeader />
      </div>
      <TransactionFilterBar />
      <div className="min-h-0 flex-1">
        <TransactionList />
      </div>
    </div>
  )
}

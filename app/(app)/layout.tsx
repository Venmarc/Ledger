import React from 'react'
import { Sidebar } from '@/components/sidebar'
import { BottomNav } from '@/components/bottom-nav'
import { TopBar } from '@/components/top-bar'
import { ProfileSync } from '@/components/profile-sync'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { LayoutShell } from '@/components/layout-shell'
import { QuickAddFab } from '@/components/quick-add-fab'
import { QuickAddSheet } from '@/components/transactions/quick-add-sheet'
import { EditTransactionSheet } from '@/components/transactions/edit-transaction-sheet'

export default async function AppProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <LayoutShell>
      <ProfileSync />
      {/* Sidebar for Desktop */}
      <Sidebar />
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-[64px] md:pb-0 desktop-layout-content">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 max-w-[1100px] w-full mx-auto">
          {children}
        </main>
      </div>

      <QuickAddFab />
      <QuickAddSheet />
      <EditTransactionSheet />

      {/* Bottom Nav for Mobile */}
      <BottomNav />
    </LayoutShell>
  )
}

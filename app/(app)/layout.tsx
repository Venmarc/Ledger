import React from 'react'
import { Sidebar } from '@/components/sidebar'
import { BottomNav } from '@/components/bottom-nav'
import { TopBar } from '@/components/top-bar'
import { ProfileSync } from '@/components/profile-sync'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Plus } from 'lucide-react'
import { LayoutShell } from '@/components/layout-shell'

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

      <button
        className="fixed right-4 bottom-[80px] md:right-8 md:bottom-8 w-14 h-14 bg-orange text-orange-btn-text rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.3)] hover:bg-orange-hover hover:-translate-y-0.5 active:scale-95 transition-all duration-150 z-50 cursor-pointer"
        aria-label="Quick Add Transaction"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Bottom Nav for Mobile */}
      <BottomNav />
    </LayoutShell>
  )
}

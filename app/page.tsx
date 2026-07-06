import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs'
import { Wallet, ArrowRight, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] font-sans antialiased text-[#F5F5F5]">
      {/* Navigation Header */}
      <header className="flex items-center justify-between w-full border-b border-[#2A2A2A] bg-[#141414] py-4 px-6 md:px-12 z-10">
        <div className="flex items-center gap-2 cursor-pointer transition-transform duration-200 hover:-translate-y-[2px] group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA6C0A] shadow-[0_0_12px_rgba(249,115,22,0.3)] group-hover:shadow-[0_0_16px_rgba(249,115,22,0.5)] transition-shadow duration-200">
            <Wallet className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F5F5F5] font-display">
            Ledger
          </span>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="h-10 px-5 text-sm font-semibold rounded-lg border border-[#3A3A3A] bg-transparent text-[#F5F5F5] transition-colors duration-150 hover:bg-[#232323] cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="h-10 px-5 text-sm font-semibold rounded-lg bg-[#F97316] text-[#0A0A0A] transition-all duration-150 hover:bg-[#EA6C0A] hover:-translate-y-[1px] active:translate-y-0 cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.2)]">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-24 max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-3xl gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7C2D12] bg-[#431407] text-[#F97316] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Personal Finance OS
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#F5F5F5] font-display leading-[1.1] max-w-2xl">
            Track every Naira. <br />
            <span className="bg-gradient-to-r from-[#F97316] to-[#38BDF8] bg-clip-text text-transparent">
              Build financial clarity.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#A3A3A3] max-w-lg leading-relaxed">
            Fast, secure expense tracking built for Nigerian realities. Kill bad spending, hit your monthly budgets, and master your money.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto justify-center">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="h-12 px-8 text-base font-bold rounded-xl bg-[#F97316] text-[#0A0A0A] transition-all duration-150 hover:bg-[#EA6C0A] hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(249,115,22,0.3)]">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <a
                href="/dashboard"
                className="h-12 px-8 text-base font-bold rounded-xl bg-[#F97316] text-[#0A0A0A] transition-all duration-150 hover:bg-[#EA6C0A] hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(249,115,22,0.3)]"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </a>
            </Show>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-24 w-full">
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#141414] border border-[#2A2A2A] hover:bg-[#1C1C1C] transition-colors duration-150">
            <div className="w-10 h-10 rounded-xl bg-[#431407] border border-[#7C2D12] flex items-center justify-center text-[#F97316]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F5F5]">Real-time Insights</h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              Understand your money leaks. Monitor Transport, Feeding, and College expenses instantly.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#141414] border border-[#2A2A2A] hover:bg-[#1C1C1C] transition-colors duration-150">
            <div className="w-10 h-10 rounded-xl bg-[#082F49] border border-[#0F5A82] flex items-center justify-center text-[#38BDF8]">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F5F5]">Budget vs Actual</h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              Set monthly category targets. View clean, real-time warning indicators when you approach 75% limit.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#141414] border border-[#2A2A2A] hover:bg-[#1C1C1C] transition-colors duration-150">
            <div className="w-10 h-10 rounded-xl bg-[#052E16] border border-[#166534] flex items-center justify-center text-[#22C55E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F5F5]">Secure & Trustworthy</h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              Fintech-grade data security with Clerk authentication. Your financial data is private and locked.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#2A2A2A] bg-[#141414] py-6 px-6 text-center text-sm text-[#6B6B6B]">
        &copy; {new Date().getFullYear()} Ledger. All rights reserved. Built for Nigerian financial discipline.
      </footer>
    </div>
  )
}

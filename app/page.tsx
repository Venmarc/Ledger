import { Show, UserButton } from '@clerk/nextjs'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowRight, Receipt, Landmark, Target, BarChart3, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-base font-sans antialiased text-text-primary selection:bg-orange/30 selection:text-orange">
      {/* Navigation */}
      <header className="flex items-center justify-between w-full border-b border-border bg-bg-surface/80 backdrop-blur-md py-4 px-6 md:px-12 sticky top-0 z-50">
        <Logo showText size={32} />

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <Show when="signed-out">
            <Link href="/sign-in" className="h-11 md:h-10 px-5 text-sm font-semibold rounded-md border border-border-strong bg-transparent text-text-primary transition-colors duration-150 hover:bg-bg-subtle flex items-center justify-center cursor-pointer">
              Sign In
            </Link>
            <Link href="/sign-up" className="h-11 md:h-10 px-5 text-sm font-semibold rounded-md bg-orange text-text-inverse transition-all duration-150 hover:bg-orange-hover hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(249,115,22,0.2)]">
              View Demo
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="h-11 md:h-10 px-5 text-sm font-semibold rounded-md border border-border-strong bg-transparent text-text-primary transition-colors duration-150 hover:bg-bg-subtle flex items-center justify-center cursor-pointer"
            >
              Dashboard
            </Link>
            <UserButton />
          </Show>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-12 md:py-24 space-y-24">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-border bg-orange-muted text-orange text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Ledger Personal Finance OS
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] font-display text-text-primary max-w-xl">
              Track every ₦.<br />
              Kill bad spending.<br />
              <span className="text-azure">Build clarity.</span>
            </h1>

            <p className="text-lg text-text-secondary max-w-md leading-relaxed">
              A serious, high-precision finance tracker tailored for Nigerian realities. No bank-sync delays. Log expenses in under 10 seconds.
            </p>

            <div className="pt-2">
              <Show when="signed-out">
                <Link href="/sign-up" className="h-12 px-8 text-base font-bold rounded-md bg-orange text-text-inverse transition-all duration-150 hover:bg-orange-hover hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(249,115,22,0.3)]">
                  Log First Transaction
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="h-12 px-8 text-base font-bold rounded-md bg-orange text-text-inverse transition-all duration-150 hover:bg-orange-hover hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(249,115,22,0.3)]"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Show>
            </div>
          </div>

          {/* Visual Board Mockup (Right Column) */}
          <div className="lg:col-span-5 hidden lg:block bg-bg-surface border border-border p-6 rounded-lg relative overflow-hidden group hover:border-border-strong transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-mono text-text-tertiary">#01 / VISUAL WORLD</span>
                <span className="w-2.5 h-2.5 bg-orange rounded-full animate-pulse" />
              </div>
              <div className="aspect-[4/3] bg-bg-base border border-border rounded p-4 flex flex-col justify-between font-mono">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Naira balance</span>
                  <span>₦ - tnum</span>
                </div>
                <div className="text-4xl font-bold font-sans tracking-tight tabular-nums text-text-primary">
                  ₦450,200.<span className="text-text-tertiary text-2xl">00</span>
                </div>
                <div className="w-full bg-bg-surface h-1.5 rounded-full overflow-hidden">
                  <div className="bg-azure h-full w-[65%]" />
                </div>
                <div className="flex justify-between text-[10px] text-text-tertiary">
                  <span>Transport Spent</span>
                  <span className="text-azure">65% of budget</span>
                </div>
              </div>
              <p className="text-xs italic text-text-secondary text-center font-display">
                &ldquo;Clarity builds confidence&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold font-display tracking-tight border-b border-border pb-3">
            Engineered Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-bg-surface border border-border rounded-lg hover:bg-bg-subtle hover:border-border-strong transition-all duration-150">
              <Receipt className="w-8 h-8 text-orange mb-4" />
              <h3 className="text-lg font-bold font-display text-text-primary mb-2">Snappy Logging</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Log transport or feeding costs on your mobile phone in under 10 seconds with draft caching.
              </p>
            </div>

            <div className="p-6 bg-bg-surface border border-border rounded-lg hover:bg-bg-subtle hover:border-border-strong transition-all duration-150">
              <Landmark className="w-8 h-8 text-azure mb-4" />
              <h3 className="text-lg font-bold font-display text-text-primary mb-2">Category Budgets</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Set firm category constraints. Receive warnings at 75% thresholds and indicators on overflow.
              </p>
            </div>

            <div className="p-6 bg-bg-surface border border-border rounded-lg hover:bg-bg-subtle hover:border-border-strong transition-all duration-150">
              <Target className="w-8 h-8 text-green mb-4" />
              <h3 className="text-lg font-bold font-display text-text-primary mb-2">Goal Projections</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Track specific savings goals (Emergency, School Fees) and verify contribution progress.
              </p>
            </div>

            <div className="p-6 bg-bg-surface border border-border rounded-lg hover:bg-bg-subtle hover:border-border-strong transition-all duration-150">
              <BarChart3 className="w-8 h-8 text-amber mb-4" />
              <h3 className="text-lg font-bold font-display text-text-primary mb-2">Leaks Detection</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Visualize spending trends and isolate recurring categories that leak financial control.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-surface py-8 px-6 text-center text-sm text-text-secondary">
        <div className="max-w-[1100px] w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-xs">LEDGER // PORTFOLIO SYSTEM</span>
          <span className="text-text-tertiary">Built by Venmarc &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}

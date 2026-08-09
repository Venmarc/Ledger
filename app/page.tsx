import { UserButton } from '@clerk/nextjs'
import { Logo } from '@/components/logo'
import { AuthShow } from '@/components/landing/auth-show'
import { ThemeToggle } from '@/components/theme-toggle'
import { CursorGlowCard } from '@/components/landing/cursor-glow-card'
import {
  ArrowRight,
  Receipt,
  Landmark,
  Target,
  BarChart3,
  RefreshCw,
  Smartphone,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-static'

const GITHUB_URL = 'https://github.com/Venmarc/Ledger'

/** Lucide removed brand logos; inline GitHub mark keeps CTA honest. */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: Receipt,
    title: 'Lightning-fast logging',
    description:
      'Add income or expenses in under 10 seconds via the floating action button.',
    accent: 'text-orange',
  },
  {
    icon: Landmark,
    title: 'Budget tracking',
    description:
      'Set monthly budgets per category. Watch them update in real time as you spend.',
    accent: 'text-azure',
  },
  {
    icon: Target,
    title: 'Savings goals',
    description:
      'Set a target, log contributions, watch the progress ring fill.',
    accent: 'text-green',
  },
  {
    icon: BarChart3,
    title: 'Spending analytics',
    description:
      'Category breakdowns, month-over-month comparison, and money leak detection.',
    accent: 'text-amber',
  },
  {
    icon: RefreshCw,
    title: 'Recurring transactions',
    description:
      'Templates for salary, subscriptions, and regular expenses with due-date prompts.',
    accent: 'text-azure',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first PWA',
    description:
      'Installable on your phone. Built to be used daily, not demoed once.',
    accent: 'text-orange',
  },
] as const

const TECH_STACK = [
  'Next.js',
  'TypeScript',
  'Supabase',
  'Clerk',
  'Tailwind CSS',
  'shadcn/ui',
  'Recharts',
  'TanStack Query',
  'Zustand',
  'Vercel',
] as const

export default function Home() {
  return (
    <div className="flex flex-col bg-bg-base font-sans antialiased text-text-primary selection:bg-orange/30 selection:text-orange">
      {/* ================================================================
          FIRST SCREEN — fills the browser window (Effects_Glossary #2)
          Nav + hero share one 100dvh block. Soft pool glow at bottom (#1).
          ================================================================ */}
      <div className="section-pool-glow flex min-h-[100dvh] flex-col">
        {/* z-0: art — tiny blur CSS bg paints first; sharp WebP swaps in */}
        <div className="hero-media" aria-hidden="true">
          <Image
            src="/hero/ledger-hero.webp"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={70}
            className="hero-media-img"
            // Decorative only — text already carries meaning
          />
        </div>
        {/* z-1: film under copy + glows. Tune --hero-film-opacity in globals.css */}
        <div className="hero-film" aria-hidden="true" />

        <header className="relative z-50 flex w-full items-center justify-between border-b border-border bg-bg-surface/80 px-6 py-4 backdrop-blur-md md:px-12">
          <Logo showText size={32} />

          <div className="flex items-center gap-3 md:gap-4">
            <ThemeToggle />

            <AuthShow when="signed-out">
              {/* Nav = Theme Toggle -> GitHub -> Sign In (deliberate deviation from
                  PAGE_SPECS.md's View Demo primary CTA — see NOTES.md Gate 1 entry).
                  Real sign-up stays reachable via the hero CTA and /sign-in itself. */}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border-strong bg-transparent px-4 text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-bg-subtle md:h-10 md:px-5"
              >
                <GitHubIcon className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <Link
                href="/sign-in"
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-orange px-5 text-sm font-semibold text-orange-btn-text shadow-[0_4px_12px_rgba(249,115,22,0.2)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-orange-hover active:translate-y-0 md:h-10"
              >
                Sign In
              </Link>
            </AuthShow>
            <AuthShow when="signed-in">
              <Link
                href="/dashboard"
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-transparent px-5 text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-bg-subtle md:h-10"
              >
                Dashboard
              </Link>
              <UserButton />
            </AuthShow>
          </div>
        </header>

        <section className="relative z-10 flex flex-1 items-center">
          <div className="mx-auto w-full max-w-[1100px] px-6 py-12 md:py-16">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="space-y-6 text-left lg:col-span-7">
                <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-6xl">
                  {/* ₦ is outside Space Grotesk; system stack carries the currency glyph */}
                  Track every{' '}
                  <span className="currency-naira" aria-label="naira">
                    ₦
                  </span>
                  .
                  <br />
                  Kill bad spending.
                  <br />
                  <span className="text-azure">Build clarity.</span>
                </h1>

                <p className="max-w-md text-lg leading-relaxed text-text-secondary">
                  A personal finance tracker built for Nigerian realities.
                  NGN-first, mobile-first, fast transaction logging, and deep
                  spending insights.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <AuthShow when="signed-out">
                    <Link
                      href="/sign-up"
                      className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-orange px-8 text-base font-bold text-orange-btn-text shadow-[0_4px_16px_rgba(249,115,22,0.3)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-orange-hover active:translate-y-0"
                    >
                      Log First Transaction
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-border-strong bg-transparent px-6 text-base font-semibold text-text-primary transition-colors duration-150 hover:bg-bg-subtle"
                    >
                      <GitHubIcon className="h-5 w-5" />
                      View on GitHub
                    </a>
                  </AuthShow>
                  <AuthShow when="signed-in">
                    <Link
                      href="/dashboard"
                      className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-orange px-8 text-base font-bold text-orange-btn-text shadow-[0_4px_16px_rgba(249,115,22,0.3)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-orange-hover active:translate-y-0"
                    >
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </AuthShow>
                </div>
              </div>

              {/* Right column: dashboard screenshot inside the cursor-glow frame */}
              <div className="hidden lg:col-span-5 lg:block">
                <CursorGlowCard
                  className="border-border bg-bg-surface/80 transition-[border-color] duration-300 hover:border-border-strong"
                  aria-label="Ledger dashboard preview"
                >
                  <Image
                    src="/dashboard.png"
                    alt="Ledger dashboard showing monthly spending, budgets, and recent transactions"
                    fill
                    sizes="(min-width: 1024px) 40vw, 0px"
                    className="object-cover object-top"
                  />
                </CursorGlowCard>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================================================================
          SECOND SCREEN — product substance from PAGE_SPECS
          Same soft pool glow treatment (#1).
          ================================================================ */}
      <div className="section-pool-glow">
        <main className="relative z-10 mx-auto w-full max-w-[1100px] space-y-24 px-6 py-20 md:py-28">
          {/* What it does */}
          <section className="space-y-8">
            <h2 className="border-b border-border pb-3 font-display text-2xl font-bold tracking-tight text-text-primary">
              What it does
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description, accent }) => (
                <div
                  key={title}
                  className="rounded-lg border border-border bg-bg-surface p-6 transition-all duration-150 hover:border-border-strong hover:bg-bg-subtle"
                >
                  <Icon className={`mb-4 h-8 w-8 ${accent}`} aria-hidden />
                  <h3 className="mb-2 font-display text-lg font-bold text-text-primary">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          <section className="space-y-6">
            <h2 className="border-b border-border pb-3 font-display text-2xl font-bold tracking-tight text-text-primary">
              Tech Stack
            </h2>
            <ul className="flex flex-wrap gap-2">
              {TECH_STACK.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border bg-bg-surface px-3.5 py-1.5 text-sm font-medium text-text-secondary"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Preview — real product screenshots (PAGE_SPECS: no broken images) */}
          <section className="space-y-4">
            <h2 className="border-b border-border pb-3 font-display text-2xl font-bold tracking-tight text-text-primary">
              Preview
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-bg-surface">
                <Image
                  src="/dashboard.png"
                  alt="Ledger dashboard showing monthly spending, budgets, and recent transactions"
                  fill
                  sizes="(min-width: 768px) 70vw, 100vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-lg border border-border bg-bg-surface">
                <Image
                  src="/mobile.png"
                  alt="Ledger mobile quick-add flow for logging a transaction"
                  fill
                  sizes="220px"
                  className="object-cover object-top"
                />
              </div>
            </div>
            <p className="text-center text-sm text-text-tertiary">
              Dashboard and mobile quick-add, showing real spending data
            </p>
          </section>

          {/* CTA strip */}
          <section className="rounded-lg border border-border bg-bg-surface px-6 py-12 text-center md:px-12">
            <h2 className="mb-6 font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              See it in action
            </h2>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              <AuthShow when="signed-out">
                <Link
                  href="/sign-in"
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-orange px-8 text-base font-bold text-orange-btn-text shadow-[0_4px_16px_rgba(249,115,22,0.3)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-orange-hover active:translate-y-0"
                >
                  View Demo
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </AuthShow>
              <AuthShow when="signed-in">
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-orange px-8 text-base font-bold text-orange-btn-text shadow-[0_4px_16px_rgba(249,115,22,0.3)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-orange-hover active:translate-y-0"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </AuthShow>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-border-strong bg-transparent px-6 text-base font-semibold text-text-primary transition-colors duration-150 hover:bg-bg-subtle"
              >
                <GitHubIcon className="h-5 w-5" />
                GitHub Repo
              </a>
            </div>
            <p className="text-sm text-text-tertiary">
              Built by Venmarc · Open source
            </p>
          </section>
        </main>
      </div>

      <footer className="relative z-10 border-t border-border bg-bg-surface px-6 py-8 text-center text-sm text-text-secondary">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-text-secondary">Ledger — Built by Venmarc</span>
          <span className="text-text-tertiary">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  )
}

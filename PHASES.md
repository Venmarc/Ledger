# PHASES.md — Implementation Roadmap
**Project:** Ledger
**Last Updated:** 06/07/2026
**Status:** Pre-build. Docs phase complete.
 
**References:** PRD.md · TRD.md · SCHEMA.md · APP_FLOW.md · PAGE_SPECS.md · UI/UX_BRIEF.md · NOTES.md
 
---
 
## Constraints Going In
 
- **Deadline:** ~4 weeks from 06/07/2026. Phases 0–3 fully deployed and functional by early August.
- **Build method:** CLI (agentic). You supervise, the agent executes. This accelerates output but increases the risk of silent deviation from the docs. Watch for it.
- **Phases 4–5** are post-August. They do not exist on the August timeline. Do not scope-creep them in.
- **"Done"** means: you can take a video of the feature working with real data, with no workarounds. Not "mostly works." Not "works on desktop but not mobile." Done.
---
 
## Phase Gate Rule
 
You do not start the next phase until every gate condition in the current phase is met. No exceptions. Skipping a gate to move faster always costs more time later than the gate would have taken.
 
If a gate condition is failing, fix it before moving. Document what broke and what fixed it in NOTES.md.
 
---
 
## Phase 0 — Foundation
**Duration:** 3–4 days
**Window:** July 7–10
 
### Goal
A working skeleton that proves every critical integration is functional before a single feature is built. Auth works. Database is reachable with RLS enforced. Navigation renders correctly on mobile and desktop. Theme system is in place. Nothing else.
 
Do not build features in Phase 0. The temptation will be there. Resist it.
 
### Deliverables
 
**Project Setup**
- Next.js 15, App Router, TypeScript strict mode
- `next dev --webpack` confirmed working (not Turbopack)
- Tailwind CSS + shadcn/ui fully configured
- CSS custom properties from UI/UX_BRIEF.md §2 implemented in `globals.css`
- Dark mode as default. Theme provider wrapping the app. `data-theme` attribute on `<html>`.
- Space Grotesk + Inter loaded via `next/font`. Correct font variables applied.
- `.env.local` configured. `.env.example` committed with all keys, no values.
**Auth**
- Clerk installed and configured
- `/sign-in` and `/sign-up` pages rendering Clerk components correctly
- Auth middleware protecting all `/dashboard`, `/transactions`, `/budgets`, `/goals`, `/analytics`, `/recurring`, `/settings` routes
- Unauthenticated access to protected routes redirects to `/sign-in?redirect_url=...`
- Successful auth redirects to `/dashboard`
**Database**
- All tables from SCHEMA.md created in Supabase
- All `user_id` columns are `text`. Verified — not `uuid`.
- RLS enabled on all tables. Policies use `auth.jwt() ->> 'sub'`. Verified — not `auth.uid()`.
- `handle_updated_at` trigger applied to all tables with `updated_at` column
- All indexes from SCHEMA.md created
**Profile Sync**
- Middleware upserts a row in `public.profiles` on first sign-in using Clerk user ID
- Profile row confirmed present in Supabase after test sign-up
- Re-sign-in upserts without creating duplicate row (confirm `ON CONFLICT DO UPDATE`)
**Layout & Navigation**
- Global protected layout renders: sidebar on desktop (≥768px), bottom nav on mobile
- All nav routes link correctly and highlight active item in `--color-azure`
- FAB present on layout (non-functional placeholder is fine — wire up in Phase 1)
- Page background `--color-bg-base`. Surface elements `--color-bg-surface`. Borders `--color-border`. Confirmed in browser.
**Infrastructure**
- Global error boundary wrapping app
- Toast system (sonner or shadcn toast) wired and testable
- TanStack Query provider configured
- Zustand store initialized (empty shell — hydrated in later phases)
- Supabase client utility created with correct anon key and URL
- Seed script for default categories executable (creates the 13 categories from SCHEMA.md for a given user_id)
### Phase 0 Gate — All Must Pass
- [ ] Sign up with a new account. Profile row exists in Supabase `profiles` table.
- [ ] Sign out. Attempt to navigate to `/dashboard`. Redirected to `/sign-in`.
- [ ] Sign back in. Land on `/dashboard`.
- [ ] Open on mobile viewport. Bottom nav visible. Sidebar hidden.
- [ ] Open on desktop viewport. Sidebar visible. Bottom nav hidden.
- [ ] Dark mode is the rendered default. No flash of light mode on load.
- [ ] Run seed script. 13 categories exist in `categories` table for your user_id.
- [ ] Attempt to query another user's data directly in Supabase SQL editor using your JWT. RLS blocks it.
- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] Zero console errors in browser on any protected route.
---
 
## Phase 1 — Core Transactions
**Duration:** 5–6 days
**Window:** July 11–16
 
### Goal
The app's only job at the end of Phase 1 is to let you log transactions fast and see them in a list. Everything else is secondary. If you cannot log a transport expense in under 10 seconds comfortably on your phone, Phase 1 is not done.
 
### Deliverables
 
**Quick Add (FAB → Sheet)**
- FAB wired and visible on all protected pages
- Bottom sheet opens on FAB tap. Closes on backdrop tap, drag down, or explicit close.
- Form fields in order: amount, type toggle, category selector, payment method, date, description
- Amount input: auto-focused on sheet open, numeric keyboard on mobile, Inter tabular-nums styling
- Category selector: pill grid, most-recently used categories float to top
- Date: defaults to today (Africa/Lagos). Tappable to change.
- Validation: amount required and > 0, category required. All other fields optional.
- Submit: optimistic update posts transaction to list. Sheet closes. Success toast fires.
- Failure: toast error with retry. Sheet reopens with data intact.
- Draft persistence: Zustand `persist` middleware writing to `localStorage`. Draft restored on next FAB open. "Draft restored" label visible. Discard button clears draft.
**Transaction CRUD**
- Create: via Quick Add (above)
- Read: transaction list on `/transactions` (below)
- Update: tap any transaction row → edit sheet (same layout as Quick Add, pre-filled)
- Delete: swipe left (mobile) / three-dot menu (desktop) → confirmation dialog → optimistic removal → 5-second undo toast
**Transaction List (`/transactions`)**
- Infinite scroll, 20 rows per load
- Grouped by date with date headers
- Each row: category icon circle, category name, description (truncated), amount (colored by type), payment method
- Sticky filter bar: date range, type toggle, category multi-select, payment method, search
- Filter state persists in Zustand for session
- Empty state and error state per PAGE_SPECS.md
- All monetary values via `formatNGN()`
**Categories (`/settings/categories`)**
- List of all categories grouped by type (expense / income)
- Add new category: name, type, color (from palette), icon (optional)
- Rename existing (inline or sheet)
- Archive (with confirmation, blocked if linked transactions exist... actually not blocked — archived but transactions retain the category_id)
- Default categories: renameable, not archiveable from this UI in v1
**Dashboard v1 (`/dashboard`)**
- Month summary card: income total, expense total, balance for current month
- Recent transactions: last 8 rows, same format as transaction list rows
- Month selector functional (changes summary numbers)
- Empty states per PAGE_SPECS.md
- FAB wired
### Phase 1 Gate — All Must Pass
- [ ] Log a transport expense on your phone. Tap to saved in under 10 seconds. Time it.
- [ ] Log an income transaction. Appears in list with green amount. Dashboard income total updates.
- [ ] Edit a transaction. Changes reflected immediately in list and dashboard.
- [ ] Delete a transaction. Disappears. Undo toast appears. Tap undo — it comes back.
- [ ] Close the Quick Add sheet mid-fill (without saving). Re-open FAB. Draft is restored.
- [ ] Enter 20 real transactions from the past two weeks of your actual spending.
- [ ] Transaction list filters by category correctly.
- [ ] Transaction list filters by date range correctly.
- [ ] Dashboard month summary numbers are arithmetically correct. Verify manually against your 20 transactions.
- [ ] `npx tsc --noEmit` passes. Zero console errors.
---
 
## Phase 2 — Budgets & Savings Goals
**Duration:** 5–6 days
**Window:** July 17–22
 
### Goal
Raw spending data becomes actionable. You can set limits and watch them respond to your real spending in real time. You can define what you're saving toward and see progress that means something.
 
### Deliverables
 
**Budgets (`/budgets`)**
- Monthly budget CRUD (create, read, update, delete)
- Budget cards with progress bars (color logic: azure → amber at 75% → red at 100%+)
- Budget vs actual computed at query time from transactions
- Month selector (past months read-only)
- Budget summary bar (total budgeted, total spent, remaining)
- Add/edit budget sheet: category selector (only unbudgeted categories for that month), amount
- Unique constraint enforced: one budget per category per month
- Dashboard updated: budget health mini-cards (up to 4, priority: most overspent first)
- TanStack Query invalidation: posting a transaction via FAB while on /budgets updates the affected card in real time
**Savings Goals (`/goals` + `/goals/[id]`)**
- Goals CRUD: create, read, archive, delete
- Goal cards: progress ring (azure fill), ₦current / ₦target, target date if set
- Active goals vs completed goals sections
- Goal detail page: large ring, stats row, log contribution sheet
- Contribution logging updates `current_amount` on the goal row
- Contribution history: v1 shows total only, not itemized (no `goal_contributions` table yet — document in NOTES.md as post-v1)
- Goal actions: mark complete, archive, delete
**Dashboard v2 Updates**
- Goals preview section: up to 3 active goals with mini progress rings
- Budget health section now live with real data
### Phase 2 Gate — All Must Pass
- [ ] Set a budget for Transport and one other category.
- [ ] Log 3 transport transactions via FAB. Budget card progress bar updates correctly after each one.
- [ ] Spend past the Transport budget. Card turns red. Amount over budget shown.
- [ ] Navigate to a past month. Budget data is read-only (no edit/add buttons visible).
- [ ] Create a savings goal (e.g. Smartwatch). Log 2 contributions. Progress ring updates.
- [ ] Dashboard shows budget cards and goals preview with real data.
- [ ] Budget vs actual numbers match manual calculation from your real transactions.
- [ ] `npx tsc --noEmit` passes. Zero console errors.
---
 
## Phase 3 — Analytics, Recurring & Completion
**Duration:** 5–6 days
**Window:** July 23–28
 
### Goal
The app becomes a complete tool. Analytics turns your data into insight. Recurring templates handle your predictable transactions. The currency widget is wired. Every page in PAGE_SPECS.md is built. The app is deployable and demonstrable.
 
### Deliverables
 
**Analytics (`/analytics`)**
- All sections from PAGE_SPECS.md §10 built:
  - Spending by category (horizontal bar chart + breakdown table)
  - Income vs expenses (summary numbers)
  - Month-over-month comparison (requires 2+ months of data — handles gracefully if not available)
  - Top 5 spending categories (ranked list)
  - Money leaks (requires budget data + 2+ months — handles gracefully)
  - Daily spending trend (line chart)
- Month selector functional
- All charts: Recharts, dark mode, transparent background, colors from UI/UX_BRIEF.md §9
- Tooltips formatted via `formatNGN()`
- All loading skeletons shaped like the charts they replace
- Empty/insufficient data states per PAGE_SPECS.md
**Recurring Transactions (`/recurring`)**
- Template CRUD: create, edit, deactivate, delete
- Due Now section: templates where `next_date <= today` highlighted at top
- Confirm action: creates real transaction row with `recurring_id`, advances `next_date` by frequency
- Skip action: advances `next_date` without creating transaction
- Dashboard recurring due banner: appears when items are due, links to /recurring
- Frequency options: Daily, Weekly, Monthly, Yearly
**Currency Reference Widget**
- Wired in `/settings`
- Fetches rates from public API on page load (frankfurter.app or exchangerate-api.com)
- Calculates USD, GBP, EUR equivalents client-side on ₦ input change
- Rate cached for session (no refetch on every keystroke)
- Failure state: "Rates unavailable" — rest of app unaffected
**Settings Completion (`/settings`, `/settings/categories`)**
- Profile section displaying Clerk data
- Default payment method preference (stored in `profiles` or localStorage — document decision in NOTES.md)
- Sign out wired
- Category management fully functional
**Landing Page (`/`)**
- All sections from PAGE_SPECS.md §1 built
- Meta tags from PAGE_SPECS.md §1 implemented
- Static generation confirmed (`force-static`)
- Realistic Nigerian transaction data visible in any screenshots used
- "View Demo" and "GitHub" CTAs linked correctly
**Deployment**
- Deployed to Vercel
- Environment variables configured in Vercel dashboard
- Production build passes (`next build` zero errors)
- All protected routes work in production (Clerk redirect URLs configured for production domain)
- RLS confirmed working in production (not just local)
### Phase 3 Gate — All Must Pass
- [ ] Every route in APP_FLOW.md §1 exists and renders without crashing.
- [ ] Analytics page shows real data from your logged transactions. Charts are correct.
- [ ] Create a recurring template for your data bundle or transport. Confirm it when due. Transaction appears in list with `recurring_id` set.
- [ ] Currency widget converts ₦50,000 to USD/GBP/EUR. API failure shows fallback message gracefully.
- [ ] Landing page loads on mobile. Both CTAs work. Meta tags present in page source.
- [ ] App is live on Vercel. Sign up via production URL. Log a transaction. Confirm it appears.
- [ ] Share the production URL. It loads without a 500 error.
- [ ] You have at least 30 real transactions logged across at least 3 categories.
- [ ] `npx tsc --noEmit` passes on production branch. Zero console errors in production.
- [ ] A hiring manager could open the live demo right now and understand what it is within 60 seconds.
---
 
## Phase 4 — Polish, PWA & Export
**Duration:** Post-August. Estimate 5–7 days when resumed.
**Prerequisite:** Phase 3 gate fully passed AND 2+ weeks of real daily usage completed.
 
### Deliverables (When Resumed)
- PWA: manifest, service worker, offline viewing support for dashboard and recent transactions
- CSV export: transactions for a date range, monthly summary
- Light mode: refine the light theme CSS variables defined in UI/UX_BRIEF.md §2.7. Confirm every component renders correctly.
- Performance audit: Lighthouse scores. Fix anything below 85 on Performance and Accessibility.
- Responsive polish pass: every page on 375px, 390px, 768px, 1280px. Fix any layout breaks.
- Logo: design and implement SVG logo with behavior from UI/UX_BRIEF.md §5. Add to nav and landing page.
- Product tour: "Take a tour" button on dashboard. 6-step joyride-style overlay for new users / demo visitors.
- README: generate via readme-generator skill. Screenshots with real Nigerian data. Architecture overview.
### Phase 4 Gate
- [ ] App installable on Android/iOS as PWA
- [ ] CSV export downloads a correct, readable file
- [ ] Lighthouse Performance ≥ 85, Accessibility ≥ 90
- [ ] Logo rendered in nav and landing page with correct glow behavior
- [ ] README is the kind you'd be proud to have a senior engineer open
---
 
## Phase 5 — Battle Testing
**Duration:** 30 days minimum of real usage. Ongoing after Phase 4.
 
### Deliverables
- Log every transaction. Every single one. No gaps.
- Every time something feels slow, confusing, or annoying: fix it. Log it in NOTES.md first.
- Add a `goal_contributions` table when contribution history becomes necessary (already noted in PAGE_SPECS.md §9)
- Correlation insights (if data justifies it): e.g. high weekend Feeding spend correlating with low savings rate
- Basic tests for critical paths: Quick Add form, budget calculation, RLS policy verification
- Final architecture diagram for README
### Phase 5 Gate
- [ ] 30+ consecutive days of real transaction logging
- [ ] At least one spending decision you made differently because of something Ledger showed you
- [ ] At least one savings goal hit or meaningfully progressed
- [ ] App used as primary financial tracking tool — no parallel spreadsheet or notes
---
 
## Documentation Changelog
 
All doc changes are logged here. Most recent first.
 
| Date | Document | Change |
|---|---|---|
| 06/07/2026 | PHASES.md | Created. All phases defined. |
| 06/07/2026 | UIUX_BRIEF.md | Created. Color system, typography, logo behavior, component specs, motion. |
| 06/07/2026 | APP_FLOW.md | Created. All user flows and route map defined. |
| 06/07/2026 | PAGE_SPECS.md | Created. All 13 pages fully specced. |
| 06/07/2026 | SCHEMA.md | Rewritten. Type corrections applied (text user_id, RLS fix, NGN-only). |
| 06/07/2026 | TRD.md | Created. Merged CONSTITUTION.md + DECISIONS.md. Draft persistence added. |
| 06/07/2026 | PRD.md | Created. Replaced PROJECT.md. |
| 05/07/2026 | NOTES.md | Initial dev notes written by Victor. |
 
*Update this table every time any project document is modified. Include the document name, date, and a one-line description of what changed. This table is the audit trail for the entire project's documentation history.*
 
---
 
*When you are tempted to start Phase 2 before Phase 1's gate is passed — don't. When you are tempted to build a Phase 4 feature during Phase 2 — don't. The phases exist because you have a history of not shipping. The gates exist to make sure "done" means done.*

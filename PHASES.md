# PHASES.md — Implementation Roadmap
**Project:** Ledger
**Last Updated:** 21/07/2026
**Status:** Phase 1 **gate passed** (Victor, 21/07/2026). Ready for Phase 2 (Budgets & Savings Goals). Multi-select filter enhancement noted in NOTES.md (backlog, not Phase 2 scope).
 
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
**Window:** July –10
 
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
- Theme provider supports toggling `data-theme` between `"dark"` and `"light"` — the mechanism must work end-to-end even though light mode's final visual polish happens in Phase 4. This is not optional scaffolding. Per NOTES.md, theme switching must be architected at project start or every component built afterward will need retrofitting.
- Every CSS custom property in UI/UX_BRIEF.md §2 (dark) and §2.7 (light placeholder) is wired into the theme provider now. Components must reference `var(--color-*)`, never hardcoded hex values — this is what makes the later light mode refinement a values-only change, not a rebuild.
- Build the real, permanent Theme Toggle component now — not a temporary dev placeholder. Placement per APP_FLOW.md §3.2 (closest to center among top-bar icons, every page). Functional: toggles `data-theme`, persists to `localStorage` under `ledger-theme`, defaults to dark on first visit regardless of OS preference. Full component spec in UI/UX_BRIEF.md §6.10. This component does not get rebuilt in Phase 4 — only the light-mode color values it switches to are refined then.
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
- [ ] Tap the Theme Toggle. `data-theme` switches to `"light"`. Background, text, and border colors visibly change across the whole app — even if the light values are rough placeholders. This confirms every component is reading CSS variables, not hardcoded colors.
- [ ] Reload the page after switching to light. Theme stays light (localStorage persistence confirmed). No flash of dark mode before light applies.
- [ ] Toggle is positioned correctly per APP_FLOW.md §3.2 on at least 3 different pages (e.g. Dashboard, Transactions, Landing) — closest to center among top-bar icons on each.
- [ ] Grep the codebase for hardcoded hex values in component files (`#[0-9A-Fa-f]{3,6}`). Only `globals.css` (or the theme definition file) should contain raw hex. Any hex found in a component is a violation of TRD.md §6.1 and must be fixed before the gate passes.
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
### Phase 1 implementation note (2026-07-16 → 2026-07-21)

Built in chunks P1-A→P1-H: foundations, data layer, shared UI, Quick Add, list/filters, edit/delete/undo, categories, dashboard v1. Auth bridge: Clerk JWT template preferred; service-role fallback after Clerk auth if template missing (post-pause fix). Category auto-seed when user has zero categories.

**Post-build polish (not Phase 2):**
- **19/07:** Dual SnapSlider month control; filter bar rebuild (search + sheet + chips); sidebar icon-rail collapse; `keepPreviousData` on list/summary queries.
- **21/07:** Delete confirm z-index (`AlertDialog` `z-[130]` above BottomSheet `z-[100]`); ⋮ menu delete hoisted to list parent so outside-click no longer unmounts confirm; sheet Escape defers to open alert dialog. See NOTES.md 21/07.

**Agent verification (not the product gate):** `npx tsc --noEmit` pass as of 2026-07-21 (delete fix). Full lint/build last green at P1-I (2026-07-16) — re-run before claiming gate.

### Phase 1 Gate — All Must Pass
*(Victor only — agents must not check these off or start Phase 2 without explicit sign-off.)*
- [x] Log a transport expense on your phone. Tap to saved in under 10 seconds. Time it.
- [x] Log an income transaction. Appears in list with green amount. Dashboard income total updates.
- [x] Edit a transaction. Changes reflected immediately in list and dashboard.
- [x] Delete a transaction. Disappears. Undo toast appears. Tap undo — it comes back.
- [x] Close the Quick Add sheet mid-fill (without saving). Re-open FAB. Draft is restored.
- [x] Enter 20 real transactions from the past two weeks of your actual spending.
- [x] Transaction list filters by category correctly.
- [x] Transaction list filters by date range correctly.
- [x] Dashboard month summary numbers are arithmetically correct. Verify manually against your 20 transactions.
- [x] `npx tsc --noEmit` passes. Zero console errors.

**Gate closed:** 21/07/2026 — Victor: “Phase 1 is done. … No bugs identified.”
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
- Build the route handler first: `app/api/rates/route.ts`. It proxies the ExchangeRate API call server-side and returns `{ USD, GBP, EUR, lastUpdated }`. See TRD.md §4.4 and PAGE_SPECS.md §12 for full implementation detail.
- Widget calls `GET /api/rates` on page load. Never calls ExchangeRate directly.
- Calculates USD, GBP, EUR equivalents client-side from cached rates on ₦ input change.
- Rate cached in component state for the session. No refetch on keystroke.
- Failure state: "Rates unavailable" — rest of settings page and app unaffected.
- Verify: `CURRENCY_API_KEY` and `CURRENCY_API_BASE_URL` are in Vercel environment variables with no `NEXT_PUBLIC_` prefix before testing in production.
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
- Light mode: the switching architecture, persistence, and Theme Toggle component were fully built in Phase 0 per TRD.md §6.1. This phase is color-value refinement only. Finalize the light theme values in UI/UX_BRIEF.md §2.7 (currently placeholders) and visually QA every page in both themes.
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
| 21/07/2026 | PHASES.md, NOTES.md | Phase 1 gate **passed** (Victor). Multi-select filter design note (OR within category/payment; AND across dimensions). Prior same-day: polish + delete confirm z-index/lifecycle. |
| 21/07/2026 | PHASES.md, NOTES.md | Doc sync: 19/07 polish (SnapSlider month, filter rebuild, sidebar) + 21/07 delete confirm stacking (`z-[130]`) and ⋮ menu lifecycle fix. (Gate later closed same day.) |
| 16/07/2026 | PHASES.md, NOTES.md | Phase 1 implementation marked complete (gate pending Victor). Documented Supabase pause/resume vs Clerk JWT template root cause + auth fallback + category auto-seed. |
| 07/07/2026 | APP_FLOW.md, PAGE_SPECS.md, UIUX_BRIEF.md, PHASES.md | Added Theme Toggle as a global component. Fixed placement rule (closest to center, every page, public + protected). Corrected Phase 0/4 split — toggle is real and permanent from Phase 0 with localStorage persistence, not a dev-only placeholder rebuilt later. Added component spec (icon, size, transition, flash-prevention) to UIUX_BRIEF §6.10. |
| 06/07/2026 | PHASES.md, TRD.md, UIUX_BRIEF.md | Fixed dark/light theme contradiction. NOTES.md and TRD §6.1 required theme switching architected at project start, but Phase 0 never verified it and Phase 4 read like the initial build. Phase 0 now requires a working dev-only toggle + hex-value grep gate. Phase 4 reworded to "refinement only." UIUX_BRIEF §2.7 reworded from "Future — Structure Only" to explicit phase ownership. |
| 06/07/2026 | PHASES.md | Patched Phase 3 currency widget deliverable — route handler pattern documented, provider confirmed as exchangerate-api.com. |
| 06/07/2026 | PAGE_SPECS.md | Patched Settings currency widget section — added full route handler implementation detail. Agent no longer needs to guess. |
| 06/07/2026 | TRD.md | Added §4.4 external API proxy pattern. Updated §8 env vars — removed NEXT_PUBLIC_CURRENCY_API_URL, replaced with CURRENCY_API_KEY and CURRENCY_API_BASE_URL. |
| 06/07/2026 | PHASES.md | Created. All phases defined. |
| 06/07/2026 | UIUX_BRIEF.md | Created. Color system, typography, logo behavior, component specs, motion. |
| 06/07/2026 | APP_FLOW.md | Created. All user flows and route map defined. |
| 06/07/2026 | PAGE_SPECS.md | Created. All 13 pages fully specced. |
| 06/07/2026 | SCHEMA.md | Rewritten. Type corrections applied (text user_id, RLS fix, NGN-only). |
| 06/07/2026 | TRD.md | Created. Merged CONSTITUTION.md + DECISIONS.md. Draft persistence added. |
| 06/07/2026 | PRD.md | Created. Replaced PROJECT.md. |
| 05/07/2026 | NOTES.md | Initial dev notes written by RedMane. |
 
*Update this table every time any project document is modified. Include the document name, date, and a one-line description of what changed. This table is the audit trail for the entire project's documentation history.*
 
---
 
*When you are tempted to start Phase 2 before Phase 1's gate is passed — don't. When you are tempted to build a Phase 4 feature during Phase 2 — don't. The phases exist because you have a history of not shipping. The gates exist to make sure "done" means done.*

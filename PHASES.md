# PHASES.md — Implementation Roadmap
**Project:** Ledger
**Last Updated:** 19/08/2026
**Status:** Phase 1 **gate passed** (Victor, 21/07/2026). Phase 2 **gate passed** (Victor, 28/07/2026). **Phase 3 gate passed** (Victor, 19/08/2026 — items 1–9 confirmed; item 10 deferred to Phase 4 by Victor). Phase 4 unblocked.
 
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
- [x] Sign up with a new account. Profile row exists in Supabase `profiles` table.
- [x] Sign out. Attempt to navigate to `/dashboard`. Redirected to `/sign-in`.
- [x] Sign back in. Land on `/dashboard`.
- [x] Open on mobile viewport. Bottom nav visible. Sidebar hidden.
- [x] Open on desktop viewport. Sidebar visible. Bottom nav hidden.
- [x] Dark mode is the rendered default. No flash of light mode on load.
- [x] Tap the Theme Toggle. `data-theme` switches to `"light"`. Background, text, and border colors visibly change across the whole app — even if the light values are rough placeholders. This confirms every component is reading CSS variables, not hardcoded colors.
- [x] Reload the page after switching to light. Theme stays light (localStorage persistence confirmed). No flash of dark mode before light applies.
- [x] Toggle is positioned correctly per APP_FLOW.md §3.2 on at least 3 different pages (e.g. Dashboard, Transactions, Landing) — closest to center among top-bar icons on each.
- [x] Grep the codebase for hardcoded hex values in component files (`#[0-9A-Fa-f]{3,6}`). Only `globals.css` (or the theme definition file) should contain raw hex. Any hex found in a component is a violation of TRD.md §6.1 and must be fixed before the gate passes.
- [x] Run seed script. 13 categories exist in `categories` table for your user_id.
- [x] Attempt to query another user's data directly in Supabase SQL editor using your JWT. RLS blocks it.
- [x] `npx tsc --noEmit` passes with zero errors.
- [x] Zero console errors in browser on any protected route.
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
- [x] Set a budget for Transport and one other category.
- [x] Log 3 transport transactions via FAB. Budget card progress bar updates correctly after each one.
- [x] Spend past the Transport budget. Card turns red. Amount over budget shown.
- [x] Navigate to a past month. Budget data is read-only (no edit/add buttons visible).
- [x] Create a savings goal (e.g. Smartwatch). Log 2 contributions. Progress ring updates.
- [x] Dashboard shows budget cards and goals preview with real data.
- [x] Budget vs actual numbers match manual calculation from your real transactions.
- [x] `npx tsc --noEmit` passes. Zero console errors.

**Gate closed:** 28/07/2026 — Victor: "I declare phase 2 complete for now."

### Phase 2 implementation log
| Chunk | Completed | What landed |
|-------|-----------|-------------|
| P2-A  | 2026-07-21 17:55 WAT | Types (Budget, BudgetWithActual, SavingsGoal, …), Zod budget/goal, query keys, `lib/progress.ts`, ProgressBar, ProgressRing (house motion tokens) |
| P2-B  | 2026-07-21 18:54 WAT | budgets actions (list+actuals, CRUD, unique/month guards) + `use-budgets` hooks |
| P2-C  | 2026-07-21 20:28 WAT | /budgets full UI: summary, cards, add/edit/delete sheets, past read-only, MonthSelector |
| P2-D  | 2026-07-21 20:42 WAT | goals actions (list/get/CRUD, contribute, archive, delete) + use-goals hooks |
| P2-E  | 2026-07-23 15:10 WAT | /goals + /goals/[id] UI, rings, create/contribute sheets, archive/delete dialogs, completed section reveal |
| P2-F  | 2026-07-25 08:30 WAT | Dashboard v2 (BudgetHealth & GoalsPreview), category icons migration, neutral contrast fix, FAB tx budget query invalidation |
| P2-G  | 2026-07-25 09:00 WAT | BudgetCard responsive mobile layout fix for 375px screens, month selector centering & motion fix |
| P2-H  | 2026-07-28 | Dashboard budget mini-card content layout (compact NGN K/M bands, remaining-text status color mirroring bar bands, label/limit/bur/spent/remaining hierarchy) + dashboard transaction-row date slot fix (anchored bottom-right of line 2, `<time>` w/ aria-label, desktop date-left-of-capsule). /budgets list rows keep kobo. |

### Phase 3 implementation log
| Chunk | Completed | What landed |
|-------|-----------|-------------|
| P3-A  | 2026-07-30 12:30 WAT | Audit + targeted edits to prior-session P3-A files: removed aggregate `getSpendingAnalytics` action + `SpendingAnalytics` type + `useSpendingAnalytics` hook (PAGE_SPECS §10 "load independently" requires per-section hooks); added 5 per-section TanStack query keys (`analytics.incomeExpense/breakdown/comparison/leaks/trend`) + 5 hooks (`useMonthIncomeExpense`, `useCategoryBreakdown`, `useMonthComparison`, `useMoneyLeaks`, `useDailyTrend`); tokenized `lib/analytics.ts` `CHART_COLORS` to match UIUX_BRIEF §9 (resolved-hex literals for Recharts SVG fill compatibility); analytics skeletons adopt budgets' `Bone` helper + `aria-busy`/`aria-label`. Recharts confirmed already installed at v3.10.1 (no `package.json` edit). Math/edge cases confirmed correct, not changed. Build + tsc pass; lint filtered clean (3 pre-existing errors outside P3-A scope). |
| P3-B  | 2026-07-31 20:17 WAT | Analytics UI: `/analytics` full page with six independently-loading sections (Spending by Category, Income vs Expenses, Month-over-Month, Top 5, Money Leaks, Daily Trend); reusable `SectionShell`, `EmptyState`, `ErrorState`, `ChartTooltip`; extended `getMonthIncomeExpense` with transaction `count` for insight banner; `getMoneyLeaks` returns `null` when no active budgets exist (vs `[]` when budgets exist but nothing leaks). Implemented against `docs/P3-B-HOLES.md` review: each section now owns its own `lg:col-span-*` className (no more empty grid cells when a section hides), Month Comparison has a neutral zero-delta copy branch, Category Breakdown Y-axis labels truncate with an ellipsis via a custom tick renderer instead of clipping, Money Leaks/Month Comparison/Top Categories/Daily Trend treat `isPlaceholderData && isFetching` as loading so a hidden-on-null section can't flash last month's stale content, and `ChartTooltip`'s prop types were widened to match Recharts' actual (readonly, loosely-typed) tooltip payload shape. Category Breakdown and Money Leaks keep their section heading visible for "real" empty states (0 expenses / 0 leaks) and only fully hide via early `return null` for the no-data-possible cases (no budgets, no comparison data, all-zero trend). tsc/lint/build all pass (lint: 0 errors, down from 3 pre-existing — unrelated to this chunk). |
| P3-C  | 2026-08-03 21:40 WAT | Recurring foundations: `lib/validations/recurring.ts` (`createRecurringTemplateSchema`, `updateRecurringTemplateSchema`, shared amount/date/frequency schemas); `lib/dates.ts` +`advanceRecurringDate(dateStr, frequency)` advancing from the template's stored `next_date` (not "today"); `lib/actions/recurring.ts` — `listRecurringTemplates` ("All Templates": active-not-due + inactive, due templates excluded per PAGE_SPECS PAGE 11), `listDueRecurringTemplates` (active + `next_date <= today`), `createRecurringTemplate`/`updateRecurringTemplate` (category ownership + archived + type-match checks), `deleteRecurringTemplate`, `confirmRecurringTemplate` (inserts real `transactions` row with `recurring_id` set, then advances `next_date`), `skipRecurringTemplate` (advances `next_date`, no transaction). `lib/hooks/use-recurring.ts` — matching TanStack hooks; confirm invalidates recurring + transactions + summary + budgets + analytics query keys, skip/CRUD invalidate recurring only. `lib/query-keys.ts` and `lib/types/database.ts` (`RecurringTemplate`, `RecurringTemplateWithCategory`) were already in place from setup work. Self-review logged to `docs/P3-C-HOLES.md`: confirm/skip is two sequential writes with no DB transaction/RPC (matches existing codebase pattern — no `rpc()` calls anywhere yet, but flagged since money + duplicate-transaction risk on partial failure), no detail/single-fetch action despite an unused `queryKeys.recurring.detail(id)`, and past-dated `next_date` on create is accepted but undocumented as intentional. `npx tsc --noEmit`, `npm run lint` (0 new warnings), `npm run build` all pass clean. No recurring UI yet — that's P3-D. |
| P3-D  | 2026-08-03 | Recurring UI: `components/recurring/` — `recurring-view.tsx` (page composition: header count, Due Now section with amber dot heading, All Templates section, empty state, error state covering both due+list queries, New Recurring button), `due-row.tsx` (amber-tinted card, Confirm/Skip buttons wired to existing mutations, per-row pending state so only the tapped row shows a loading label), `template-row.tsx` (edit-opening row button + `active-switch.tsx` — a minimal custom `role="switch"` toggle, no Switch primitive existed in the project), `frequency-select.tsx` (4-way Daily/Weekly/Monthly/Yearly segmented control mirroring `TypeToggle`), `recurring-form-sheet.tsx` (create/edit BottomSheet reusing `DescriptionInput`/`TypeToggle`/`CategoryPills`/`AmountInput`/`DateField`, delete via existing `ConfirmDialog`), `skeletons.tsx`. Reused `useCategoriesByType`, all `use-recurring.ts` hooks, and `lib/dates.ts` unchanged except two additions: `RECURRING_FREQUENCY_LABEL` map and `formatRecurringDueLabel()` ("Due today" / "X days overdue", mirrors `formatGoalTargetLabel`'s shape). `app/(app)/recurring/page.tsx` now renders `RecurringView`. One real bug caught during self-review before it shipped: `reveal-grid` (a collapse/expand-to-`0fr` utility gated on `data-open`) was initially used as a plain list wrapper for the Due Now and All Templates rows — without `data-open="true"` it would have permanently collapsed both lists to zero height. Swapped to `entrance-stagger` (the correct "short list entrance" utility, already used this way in `goals-view.tsx`/`transaction-list.tsx`). Left open from `docs/P3-C-HOLES.md`: create form does not block a past-dated `next_date` (DateField's `max` is overridden to `2999-12-31` to allow future dates; no `min` set) — same as flagged in P3-C, still undecided, not blocking. Edit form reuses the row object already in the list/due query cache; no `detail(id)` action was added since nothing needed it. `npx tsc --noEmit`, `npm run lint` (0 new warnings — one pre-existing `dueError`-unused warning was fixed by simplifying the destructure), `npm run build` all pass clean. **Not visually verified in a browser** — `/recurring` is behind Clerk auth and no test session/credentials were available this session; 375px layout reasoning is from Tailwind class inspection only (grid-cols-4 frequency selector, `min-w-0`/`truncate` on row text, `flex-1`/`shrink-0` amount columns), not a rendered screenshot. |
| P3-E  | 2026-08-03 | Dashboard recurring due banner + cross-invalidation. New `components/dashboard/recurring-due-banner.tsx`: reads `useDueRecurringTemplates()` + `useUIStore.recurringBannerDismissed`, renders nothing while loading/erroring/empty/dismissed, otherwise an amber-bordered banner (same tokens as `due-row.tsx`) linking to `/recurring` with a dismiss (×) button per APP_FLOW §3.5 / PAGE_SPECS PAGE 4. Wired into `app/(app)/dashboard/page.tsx` between the header and the summary grid. Real bug found while tracing the "cross-invalidation" half of this chunk: `invalidateTransactionReads()` in `lib/hooks/use-transactions.ts` (used by create/update/delete/restore) invalidated `transactions`/`summary`/`budgets` but never `analytics` — logging a transaction via the FAB left the Analytics page stale until a hard reload. Recurring-confirm already invalidated analytics correctly via `invalidateAfterConfirm` in `use-recurring.ts` (P3-C), just not plain transaction CRUD. Fixed by adding `queryKeys.analytics.all()` to `invalidateTransactionReads`. Note: the due banner itself has nothing to invalidate *from* transaction creation — due status is purely `next_date`/`is_active`, unaffected by logging a transaction — so that half of the chunk's name was already satisfied structurally by P3-C. `npx tsc --noEmit`, `npm run lint` (0 new warnings, same 11 pre-existing unrelated ones), `npm run build` all pass clean. **Victor confirmed 2026-08-04: live in browser, working.** |
| Bug fix (out-of-band, between P3-E and P3-F) | 2026-08-04 | Balance carryover fix: Dashboard/Analytics "Balance" was strictly month-scoped (`income_this_month - expense_this_month`), silently dropping prior months' leftover money/deficit each month rollover. Not a schema change — `getMonthSummary` (`lib/actions/transactions.ts`) now sums all transactions up to month-end (no lower date bound) to derive a cumulative `balance`, while `income`/`expense` stay this-month-only; added derived `carriedIn = balance - thisMonthNet` (float-dust clamped to 0) on `MonthSummary` (`lib/types/database.ts`). Dashboard (`components/dashboard/month-summary-card.tsx`): Balance metric now shows the cumulative figure with a `▲ previous` / `▼ previous` indicator next to the label (green/red, hidden when `carriedIn === 0`); `overspent` flag and "Spending over income by X" copy were re-scoped to this month's own net so they don't misfire off an old month's carried deficit. Analytics (`components/analytics/income-expense-section.tsx`): "Net" stat replaced with the same cumulative `balance` from `useMonthSummary`, relabeled "Balance" (no indicator there, per Victor — analytics treatment can differ). Explicitly distinct from "budget rollover" (still rejected per `TRD.md` §7 / `SCHEMA.md`) — budgets untouched. Verified against Victor's real numbers (July 389,661.63 → August 386,661.63). `npx tsc --noEmit`, `npm run lint` (0 new warnings, same 11 pre-existing unrelated ones), `npm run build` all pass clean. **Victor confirmed 2026-08-04: working.** |
| P3-F  | 2026-08-04 (code shipped in commit `e3197a3`, log entry backfilled) | Currency widget: `app/api/rates/route.ts` — server proxy to exchangerate-api.com (`GET /{key}/latest/NGN`), returns `{ USD, GBP, EUR, lastUpdated }`; key read from server-only `CURRENCY_API_KEY`/`CURRENCY_API_BASE_URL` (no `NEXT_PUBLIC_` prefix), never reaches the client bundle; handles missing-env, upstream-error, and malformed-response cases distinctly (500 vs 502), all logged server-side. `components/settings/currency-widget.tsx` — client widget reusing `SectionShell`; NGN amount input converts client-side (`amount * rate`) against USD/GBP/EUR via `Intl.NumberFormat` currency formatting; loading skeletons per row, explicit error state ("Rates unavailable. Check your connection.") on fetch failure; "Not tied to your transactions. For reference only." disclaimer per spec (client-side-only conversion, no `exchange_rates` table). Wired into `app/(app)/settings/page.tsx` below the Categories nav link. This chunk's code landed in the same commit as P3-C/D/E (`feat(p3): recurring transactions ... + currency widget`) but was never logged separately — discovered and backfilled during Phase 3 resume on 2026-08-04. Verified this session: `npx tsc --noEmit` passes clean; `.env.local` has real `CURRENCY_API_KEY`/`CURRENCY_API_BASE_URL` values (not just `.env.example` placeholders). **Not re-verified live in a browser this session** — code inspection + typecheck only. |
| P3-G  | 2026-08-04 | Settings completion: Profile, Preferences (default payment method), Sign out. Resolved the "TBD — document in NOTES.md" storage decision from PAGE_SPECS PAGE 12 / overview: `profiles.default_payment_method` (nullable text, checked against the same enum as `transactions.payment_method`), not Zustand/localStorage — rationale logged in `NOTES.md` (04/08/2026 entry). New migration `scripts/migrations/20260804_default_payment_method.sql` (not yet applied against Supabase — Victor to run by hand, same as `20260724_category_icons.sql`). `lib/actions/profile.ts` gained `getProfile()`/`updateDefaultPaymentMethod()` (using the existing `getAuthedContext()`/`ActionResult` pattern, unlike the older ad-hoc `syncUserProfile()`); `lib/hooks/use-profile.ts` (new) wraps them in `useProfile()`/`useUpdateDefaultPaymentMethod()`, added to the `lib/hooks/index.ts` barrel and `queryKeys.profile`. `components/settings/profile-section.tsx` (new) — Clerk `useUser()` avatar/name/email display-only, "Edit profile" via `useClerk().openUserProfile()` (a Clerk-native modal, not a true new-tab hosted-portal link as PAGE_SPECS literally describes — deviation noted below). `components/settings/preferences-section.tsx` (new) — reuses the existing `PaymentMethodSelect` chip component (`components/transactions/payment-method-select.tsx`) bound to the new hook/mutation. `components/settings/account-section.tsx` (new) — reuses the existing full-width `SecondaryButton`, calls `useClerk().signOut({ redirectUrl: '/' })`. `app/(app)/settings/page.tsx` now renders Profile → Categories nav → Preferences → Currency Widget → Account, in that order. Quick Add pre-fill: `lib/store.ts`'s `ensureDraftForOpen` now takes an optional `defaultPaymentMethod` param (applied only when seeding a fresh, non-dirty draft — a restored dirty draft is untouched); `components/transactions/quick-add-sheet.tsx` passes `useProfile().data?.default_payment_method` in on open. **Known deviation from spec wording:** PAGE_SPECS says "Edit profile" "opens Clerk's hosted account management UI in a new tab" — implemented as `openUserProfile()` (Clerk's supported in-app modal) instead, since constructing the exact Account Portal URL from the publishable key would be guesswork and AGENTS.md's "no Clerk modals on other routes" rule is scoped to sign-in/sign-up, not user-profile management. Flagged for Victor to accept or redirect. `npx tsc --noEmit`, `npm run lint` (0 new warnings, same 11 pre-existing unrelated ones), `npm run build` all pass clean. **Not verified live in a browser** — `/settings` is behind Clerk auth and no test session/credentials were available this session; migration also not yet applied, so the preferences picker cannot round-trip against a real `default_payment_method` column until Victor runs the SQL. |

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
- [x] Every route in APP_FLOW.md §1 exists and renders without crashing. *(Victor, 19/08/2026)*
- [x] Analytics page shows real data from your logged transactions. Charts are correct. *(Victor, 19/08/2026)*
- [x] Create a recurring template for your data bundle or transport. Confirm it when due. Transaction appears in list with `recurring_id` set. *(Victor, 19/08/2026)*
- [x] Currency widget converts ₦50,000 to USD/GBP/EUR. API failure shows fallback message gracefully. *(Victor, 19/08/2026)*
- [x] Landing page loads on mobile. Both CTAs work. Meta tags present in page source. *(Victor, 19/08/2026)*
- [x] App is live on Vercel. Sign up via production URL. Log a transaction. Confirm it appears.
- [x] Share the production URL. It loads without a 500 error. *(Victor, 19/08/2026)*
- [x] You have at least 30 real transactions logged across at least 3 categories. *(Victor, 19/08/2026: 50+ actual)*
- [x] `npx tsc --noEmit` passes on production branch. Zero console errors in production. *(Victor's pre-push workflow + prod browser check, 19/08/2026)*
- [ ] A hiring manager could open the live demo right now and understand what it is within 60 seconds. **Deferred to Phase 4 per Victor 19/08/2026.**
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
| 31/07/2026 | PHASES.md, docs/PHASE-3-OVERVIEW.md, lib/actions/analytics.ts, lib/hooks/use-analytics.ts, components/analytics/skeletons.tsx, components/analytics/*.tsx (new), app/(app)/analytics/page.tsx | Closed P3-B (Analytics UI): built `/analytics` page per PAGE_SPECS §10 — six independently-loading sections, shared `SectionShell`/`EmptyState`/`ErrorState`/`ChartTooltip` primitives. `getMonthIncomeExpense` now returns transaction `count`; `getMoneyLeaks` returns `null` (no budgets, hide) vs `[]` (budgets, no leaks, show green state). Fixed all applicable holes from `docs/P3-B-HOLES.md`: per-section grid className (no empty cells), zero-delta copy branch, truncating Y-axis tick, stale-flash guard on sections that can hide, Recharts tooltip typing. tsc/lint/build pass. |
| 19/08/2026 | AGENTS.md, NOTES.md | Webpack decision reversal: `next dev --webpack` is now policy (reverted from Turbopack on 2026-08-19 — Turbopack still slow on Victor's machine; production build keeps Turbopack). `AGENTS.md:84,113` updated to "Do not remove `--webpack`". `package.json` dirty change from earlier session is now policy-aligned. `TRD.md` already correct. P3-G migration `20260804_default_payment_method.sql` applied via `supabase db query --linked`; column + CHECK constraint verified. **Phase 3 gate closed** by Victor: items 1–9 confirmed (tsc clean per pre-push workflow, zero console errors in prod browser); item 10 (hiring-manager 60s gut check) explicitly deferred to Phase 4. Phase 4 unblocked. Landing-page screenshot inventory: 13 PNGs in `~/Downloads/Ledger-sc/`, only 1 mobile (Dashboard), ~6 missing desktop pages, OG-image still absent. Mobile screenshot reshoot (13 routes × 2 themes = 26 PNGs) requested by Victor for pre-Phase-4 polish — auth decision pending.
| 30/07/2026 | PHASES.md, docs/PHASE-3-OVERVIEW.md, lib/types/database.ts, lib/query-keys.ts, lib/actions/analytics.ts, lib/analytics.ts, lib/hooks/use-analytics.ts, lib/hooks/index.ts, components/analytics/skeletons.tsx | Closed P3-A (Analytics Foundations): removed aggregate `getSpendingAnalytics` action + `SpendingAnalytics` type + `useSpendingAnalytics` hook in favor of 5 per-section hooks (useMonthIncomeExpense / useCategoryBreakdown / useMonthComparison / useMoneyLeaks / useDailyTrend) with matching `analytics.*` query sub-keys; tokenized `CHART_COLORS` to UIUX_BRIEF §9 resolved-hex literals (Recharts SVG `fill` does not resolve `var()` reliably); analytics skeletons adopt budgets' `Bone` helper + `aria-busy`/`aria-label`; JSDoc on `percentOfTotal` documents 0..1 ratio. tsc/lint/build all pass. |
| 28/07/2026 | PHASES.md, components/budgets/budget-card.tsx, components/transactions/transaction-row.tsx, lib/utils.ts, lib/progress.ts, lib/dates.ts, components/dashboard/budget-health.tsx, components/budgets/skeletons.tsx | Closed Phase 2 implementation: dashboard budget mini-card content layout (compact NGN K/M bands, status-colored remaining text mirroring bar bands, limit-under-label cluster); transaction-row date slot anchored bottom-right of line 2 with `<time datetime>` + `aria-label` long form and tabular-nums; /budgets list rows revert to kobo per claude_review.md "Not in scope". |
| 25/07/2026 | PHASES.md, PHASE-2-OVERVIEW.md, budget-card.tsx, globals.css | Closed Phase 2 deliverables: applied category icons migration SQL, fixed PostgREST SELECT query strings in budget/transaction actions, resolved dark mode neutral contrast token (#A8A29E), centered month dropdown animation, and fixed BudgetCard responsive flex layout for 375px screens. |
| 24/07/2026 | SCHEMA.md, PAGE_SPECS.md, UIUX_BRIEF.md, APP_FLOW.md, PHASES.md | Switched categories from per-category custom color to Lucide icon + uniform neutral background. Dropped `color` column from `categories` table, `icon` now required. Added §8.1 default icon mapping, §8.2 curated icon picker (14 expense + 8 income options for realistic future categories), and §6.11 Category Pill component spec to UIUX_BRIEF. Added global back-navigation rule (APP_FLOW §3.3) distinguishing primary nav pages (no back button) from sub-pages (icon-only chevron) — fixes agent confusion that added text back-links to both Category Management and Goal Detail. |
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

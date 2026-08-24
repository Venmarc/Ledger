# DEV_NOTES

## CREATED: 05/07/2026

## LAST UPDATED: 19/08/2026 (Phase 3 gate closed; webpack reverted; default payment method migration applied; landing-page screenshots inventoried)

---

## 05/08/2026 — Gate 1 (landing page audit remediation) — CHECKPOINT, updated 09/08/2026

**Status: IN PROGRESS, not closed.** This is a mid-session checkpoint, not a gate-close —
do not treat Gate 1 as done. Full plan: `~/.claude/plans/i-created-a-ledger-abundant-shell.md`.
Source audit (immutable): `SecondBrain/raw/2026-08-04-ledger-landing-page-audit.md`.

**Done (committed 09/08/2026):**
- GitHub CTAs fixed everywhere (header, hero, CTA strip) → real `https://github.com/Venmarc/Ledger`,
  `target="_blank"`, `rel="noopener noreferrer"`.
- Header nav restructured: `Theme Toggle → GitHub → Sign In` — **deliberate deviation** from
  `PAGE_SPECS.md`'s `Theme Toggle → GitHub → View Demo`. Confirmed explicitly by Victor mid-session.
  View Demo stays only in hero/CTA-strip buttons, not the header.
- Hero right column + Preview section: real screenshots (`public/dashboard.png`, `public/mobile.png`)
  replace the empty "Screenshot coming soon" placeholder.
- `app/layout.tsx`: full OG/canonical metadata. **Canonical = `https://ledgerix.vercel.app`** per
  Victor (differs from `PAGE_SPECS.md:37-45`'s `https://ledger-demo.vercel.app`); update PAGE_SPECS
  when the gate closes.
- **force-static now works.** Server-side Clerk `<Show>` (async, calls `auth()` at prerender) was
  breaking the static export, so nav/CTA auth-branches moved to a client component
  (`components/landing/auth-show.tsx`) that resolves auth after mount. PRERENDER PASSES.
- Verification: `npm run lint` 0 errors (4 pre-existing warnings), `npx tsc --noEmit` clean,
  `npm run build` succeeds and `/` renders as **○ Static**. GitHub repo URL verified
  live (HTTP 200).

**Demo-account walkaround — DEAD AND REMOVED (09/08/2026). Do not revive.**
- Live "sign in with demo credentials" is dead by design. **Clerk Device Trust** (auto-enabled for
  apps created after 2025-11-14) forces an email-code OTP on any new-device password sign-in, and
  the demo address was a fake domain with no mailbox (code unreachable). Disabling Device Trust
  would weaken security for all users — rejected.
- Account fully reverted to Victor's real `nbmichael97@gmail.com` (verified + primary); the fake
  `spidey@bnd.man` was deleted. Password was overwritten during the attempt and is unrecoverable —
  Victor resets it himself via Dashboard.
- **All read-only demo guard code was removed** (09/08/2026): `lib/demo.ts`, the
  `requireWrite`/`DEMO_USER_ID` wiring across `lib/actions/*`, and
  `scripts/migrations/20260807_demo_account_readonly.sql`. RLS migration was **never applied** to
  Supabase; `package-lock.json` churn reverted.
- Showcase route (in force): screenshots + a screen recording captured from **Victor's own trusted
  browser session** (no OTP), CTA "View the demo". Demo-login cred strip removed from
  `app/page.tsx` CTA.

**Remaining for Gate 1:**
- Confirm the deployed landing click-through / 375px no-horizontal-scroll / OG image render on
  `ledgerix.vercel.app`, then close the gate here and in `SecondBrain/06-Agent-Sessions/`.
  Plan: `~/.claude/plans/i-created-a-ledger-abundant-shell.md`.

Full technical detail, file-by-file diff summary, and remaining task list are recoverable from:
this NOTES.md entry + the plan file + `git diff` (the old `/tmp/claude-1003/…/scratchpad/
ledger-gate1-handoff-2026-08-05.md` was in `/tmp` and is gone).

---

I reverted Momentum back to it's freshest state. I have some important info that will help it during a build, so that I won't experience recurring problems like in my previous projects. Most of these below are rules that should be in TRD.md, PRD.md or PHASES.md as they guide the user and agents to a functioning project.

- If a theme is to be added to enable theme switching, then it must be added at the beginning, aas part of the project, not an add-on later. If it's done later, agents will mess it up likely, as they cannot identify that the issue is the default, hard-coded theme not accommodating new themes.
- If using Clerk Auth and Supabase, store `clerk_id` as a string like `text` not `uuid`, and all `user_id` columns as `text` type, supabase doesn't accept clerk_id just like that. it'll result in some error. Do a web search on clerk and supabase best practices, u'll get more info.
- Use Clerk with **Custom Session Tokens** (preferred for speed and control over webhooks where possible).
- Clerk user IDs stored as `text` in Supabase.
- RLS enforced via `auth.jwt() ->> 'sub'`.
- Ensure that users can access other user data by correctly entering their user ids
- next dev: -- webpack. not turbopack, as my pc can build compile as fast with turbopack. But deployment is still turbopack
- Set a goal in PRD.md and never stray from it, echo it in all project docs, otherwise scope creep sets in, and u will never ship that project.
  - Make sure all possible questions are answered in the docs, so that the agent building never strays or sees holes to jump out from.
  - Every thing is defined in the docs, this keeps the user and the agent in check ensuring they know the next steps and don't get lost.
- Prioritize SPEED, BEAUTY, and EFFICIENCY. Anything that can potentially slow down the site/app speed, make it look ugly or not function properly is cut-off before it even has the chance to.
- "Done" is when the user can take a screenshot or video of the app functioning and not have to change anything. The project isn't designed to be perfect, it is engineered to function as it should, with no half-measures.
  - "Done" is when a hiring manager can look at the project and say "hmm, this person knows what they are doing" nodding in agreement.
- The project is not a saas nor should it function as one.
- The project is a portfolio piece meant to help the user make better financial decisions.
- In PAGE_Specs is supposed to be the largest of all docs as it defines the Layout, function, structure, reasons, and overall behavior of every single page in that project, from landing to legal (ToS and Privacy policy). It exists as the foundation on which every page will be built on (APP-flow is the soil on which the foundation is built), leading to it's size. 
  - What should the landing page look like? It's in page-specs, what should the landing page do? page-specs, porfolio front door? page-specs, what should the dashboard say? page specs, what how will the cards on the goals page be positioned? page-specs, etc. signin/register page? page-specs. It answers every page related question.
  - With the above examples, u should know how to create a page specs doc. It works closely with APP-flow. Every page in APP flow is showing in page specs. App flow is defined before page specs. It defined the user journey into the app and around it.
- The agent building the app should be able to build everything precisely using the project docs, with little help from the user. The user will only provide all the env vars, supabase project values, deployment links, repo and stuff that the agent can't do from it's position.
- The docs must be updated along with the changes made to the project files. They are not stagnant. If anything is built, document it. If any changes are requested by the user, document it. The timestamp of the last time a doc/file was changed must be added to the PHASES document. The docs stay updated about everything.
- Phases is the last doc to be create when drafting docs as it says **WHEN** everything is to be built, and contains any extra infor that isn't provided in other docs.
- All docs must have a reference line that connects to other relevant docs. By default, all docs reference PRD.md, TRD.md, NOTES.md and PHASES.md. Like PHASES references everything else as it says when they'll be built. PAGE-SPECS references PRD, APP-FLOW, TRD, and UIUX-BRIEF. UIUX-BRIEF references SCHEMA if some ui decisions required database storage.

## Updated: 06/07/2026 3:20

---

## 21/07/2026 — Multi-select filters (consideration / design note)

**Victor:** Considering making the Transactions filter sheet accept **more than one value per dimension** (e.g. categories Freelance + Gifts; expense categories Airtime + Transport + Electricity; payment methods POS + Card + Transfer). Today UI effectively allows **one** category and **one** payment method at a time. Not built yet — backlog for a small polish pass or early Phase 2 UI if needed for daily use. **Not** a Phase 2 budgets/goals deliverable.

### How it works today

| Dimension | Store shape | UI | Server query |
|---|---|---|---|
| Date range | single preset / custom from–to | single | `gte`/`lte` on `transaction_date` |
| Type | `'all' \| 'income' \| 'expense'` | segmented single | `.eq('type', …)` if not all |
| Category | `categoryIds: string[]` | **forced single** — toggle replaces array with `[id]` or `[]` (`filter-bar.tsx`) | already `.in('category_id', categoryIds)` when non-empty |
| Payment | `paymentMethod: PaymentMethod \| 'all'` | single chip | `.eq('payment_method', …)` if not all |
| Search | string | free text | `or` ilike across fields |

So **multi-category is already half-ready on the server**; the UI is the main limiter. Payment multi needs type + query + UI. Type multi is optional (see below).

### Proposed semantics (OR within dimension, AND across dimensions)

A row is included if it matches **all** active dimensions:

1. **Date range** — same as now (AND).
2. **Type** — keep as today (`all` | income | expense) unless we later want “both types” explicitly. When type is income/expense, category pills stay scoped to that type (already). When type is `all`, show both income + expense category sections; selected IDs may mix types.
3. **Categories** — multi-toggle pills. Empty = any category. Non-empty = **OR** (`category_id IN (…)`). Selecting Freelance + Gifts shows txs in either category.
4. **Payment methods** — multi chips. Empty/`all` = any method. Non-empty = **OR** (`payment_method IN (…)`).
5. **Search** — still AND with the rest (narrows the multi-filter result set).

Example: type expense + categories [Transport, Airtime] + payments [POS, Transfer]  
→ expense txs whose category is Transport **or** Airtime **and** whose payment is POS **or** Transfer, inside the date range.

### Implementation sketch (when approved)

1. **Types** (`lib/types/database.ts`): keep `categoryIds: string[]`; change `paymentMethod` → `paymentMethods: PaymentMethod[]` (empty = all). Migrate filter store default + `isDefaultFilters` / chip counts in `lib/filters.ts`.
2. **Server** (`listTransactions`): categories already `.in()`; payment → `.in('payment_method', paymentMethods)` when length > 0; drop single `.eq`.
3. **UI** (`filter-bar.tsx`): category click **toggle membership** in the array (not replace); payment chips same; chips row can show “3 categories”, “2 methods” or compact multi labels.
4. **Type change cleanup:** when type switches, drop selected category IDs that no longer match that type (already partially done for single select).
5. **No schema/migration** — filters are client session + query params only.

### Explicitly out of scope for this note

- AND within the same dimension (must match *every* selected category on one row — impossible with one `category_id` per tx).
- Saving named filter presets, URL-shareable filter state (nice later).
- Multi-select on date ranges.

### Phase placement

Ship after Phase 1 gate (closed 21/07) as a small filter enhancement when Victor wants it — does not block Phase 2 Budgets/Goals.

---

## 21/07/2026 — Phase 1 gate closed (Victor)

Victor confirmed Phase 1 done (no remaining Phase 1 bugs identified after delete-confirm fix + polish). Product gate checklist treated as passed by user sign-off. **Phase 2 may start** on next session when scoped.

---

## 21/07/2026 — Delete confirm stacking + ⋮ menu lifecycle

**Symptom (inbox):** Edit-sheet delete froze the UI; ⋮ menu Delete showed confirm but confirm click did nothing.

**Root causes**
1. **Z-index:** custom `BottomSheet` root is `z-[100]`; shadcn `AlertDialog` (ConfirmDialog) was `z-50` → confirm rendered **under** the edit sheet (looked frozen).
2. **Lifecycle:** `RowActionsMenu` owned ConfirmDialog and closed on any `mousedown` outside `menuRef`. Portaled dialog is outside the menu → confirm click unmounted the menu + dialog before delete ran.

**Fix**
1. `alert-dialog.tsx` overlay + content → **`z-[130]`** (above sheets `z-100`, menus `z-60`, minimal-menu `z-120`).
2. `RowActionsMenu` no longer owns ConfirmDialog; list parent gets `onDeleteRequest` and reuses list-level confirm (same as swipe).
3. Bottom sheet Escape ignored while `[data-slot="alert-dialog-overlay"]` is present.
4. Edit sheet: close confirm after delete mutation; block dismiss while `isDeleting`.

Fixed in code; Victor later confirmed Phase 1 complete (see gate note above).

---

## 19/07/2026 — UI polish (month control + filters shipped)

**Month selector (was deferred 17/07 — now implemented):**
- Dual `SnapSlider`: month primary in pill; tap center → year eases into primary slot; month drops as absolute overlay under pill (`top-full`, not in-flow push).
- Desktop chevrons still step one month; `MIN_YEAR = 2025` product-start bound.
- Files: `components/dashboard/month-selector.tsx`, `components/ui/snap-slider.tsx`.

**Transactions filter rebuild:**
- Search + filter icon → bottom sheet; chips only when filters active.
- Type stays segmented control (not slider) — Discrete-State-Control-Selection skill.
- `keepPreviousData` on infinite / recent / month summary to avoid skeleton flash.

**Sidebar collapse polish:**
- Fixed left icon rail (`pl-3.5` / never `justify-center` mid-animation).
- Victor added nav `pl-2` for icon/highlight centering (2026-07-20).

**Clerk dev:** handshake requires `localhost`, not `127.0.0.1`.

## 17/07/2026 — Month selector redesign (historical — shipped 19/07)

Target UX (Victor; now in code — see 19/07 note above):
- Not a full-screen/modal-only month picker.
- Dropdown / expansion + year/month sliders; desktop chevrons + sliders.
- Deferred only until polish rules extracted; implemented 19/07. Gate still open.

## 16/07/2026 — Supabase pause/resume + Clerk JWT

**What pause does / does not do**
- Pause does **not** invalidate SQL migrations or drop tables. After resume, schema was verified intact (`profiles`, `categories`, `transactions`, `budgets`, `savings_goals`, `recurring_templates` all HTTP 200).
- Pause **does** block API traffic while stopped (looks like total outage). After resume, keys stay valid.
- Pause does **not** create a Clerk JWT template. If Custom Session Tokens were never finished, data actions fail with “Could not authorize database access…” even when Supabase is healthy.

**Root cause of post-resume Transactions error (2026-07-16)**
- Clerk JWT templates count was **0** — no template named `supabase`.
- App requires `getToken({ template: 'supabase' })` for RLS.
- Fix path:
  1. Server fallback: if JWT missing, use service-role client **only after** Clerk `auth()` and always scope by `user_id` (`lib/actions/auth-context.ts`).
  2. Proper bridge: `SUPABASE_JWT_SECRET=... node scripts/setup-clerk-supabase-jwt.mjs` (HS256 custom signing key = Supabase JWT Secret).
  3. Empty category table auto-seeds 13 defaults on first `listCategories` for a user.

**Not a migration replay problem.** Re-running old seed scripts is optional; use ensureDefaultCategories / open Categories page once auth works.

---

## 15/07/2026

In my portfolio site [Venmarcstudio](https://venmarcstudio.xyz), I implemented this "hero page always occupies the viewport until scrolled" feature on my hero page. Here's what I can describe it as rn:
- The hero text, and maybe image, are centered to one area on the hero page.
- Whenever u zoom out, they occupy that area and don't realign, cos they are comfortable there.
- When u zoom in however, the texts and images realign to fit how best they can--this is normal behavior without my implementation.
- The page/section under the hero page is NEVER seen until u scroll up.
- The hero page extends to fill up the viewport however big it may be, but it never extends past the page under it.
- If I were to describe with an analogy, i'd say: the hero page, text and image, are elastic sheets attached to the 4 edges of the viewport of ur desktop/phone screen (but not to the edges themselves), and when u zoom out, they are stretched but can never break. When u scroll, that elastic hero page scrolls up like normal, and the whole thing goes unnoticed.
- It's a way of introducing the hero page of ur website without cluttering the view with other page sections.
- I will want to use this feature in the landing page of all my projects, but only if my agent can define it in code, cos I can't rn.
- Maybe a little clue `min-height: vh100` or something similar.
- This feature can be applied in phase 0 or 1 of my projects, depending on what phase they are in when this suggestion came in.

**THE DOCS ARE THE SOURCE OF TRUTH**

---

## 21/07/2026 — Goal contributions v1

No `goal_contributions` table. Logging a contribution only increments
`savings_goals.current_amount`. Goal detail shows total contributed only.
Contribute sheet is amount-only (no date/note stored).
Post-v1: itemized history table + date/note fields on the contribute sheet.

---

## 24/07/2026 — Claude Dashboard Review Fixes & Phase 2 P2-F Complete

- **Bug 1 (Month selector glyph bleed):** Fixed by tightening track width (`TRACK_W = 'w-20 min-w-20 sm:w-24 sm:min-w-24'`) in `month-selector.tsx`. Confirmed visually on desktop/mobile.
- **Bug 2 (Month summary metric ambiguity):** Relabeled sub-bar text in `month-summary-card.tsx` to Option A plain expense-to-income ratio (`"₦X of ₦Y income spent this month"`).
- **Neutral Accent Tokens:** Added `--color-neutral` (#57534E), `--color-neutral-hover`, `--color-neutral-muted` (#292524 / light #F1EFEC), and `--color-neutral-border` to `globals.css` and Tailwind `@theme`.
- **Category Icon Circles:** Wired `var(--color-neutral-muted)` into category icon circle backgrounds across `transaction-row.tsx`, `budget-card.tsx`, `budget-form-sheet.tsx`, and `categories-manager.tsx`.
- **UIUX_BRIEF & Documentation:** Added §2.8 Neutral / System Accent, §12 Reusable UI Patterns, and updated §8 Iconography.

---

## 29/07/2026 — Lint error outside PHASE 3

- `npm run lint` has pre-existing errors in non-P3-A files (`category-form-sheet.tsx`, `category-icon.tsx`, `theme-toggle.tsx`).
- I'll have to check out those files and see wagwan. 

---

## 29/07/2026 — Plan-review technique (reusable prompt)

Before saving any chunk plan, run this prompt against the drafted plan to surface ambiguity. The planner writes the plan, then switches hats and reads it as a cold implementer with no other context. Output is a holes list (no fixes) — then the planner rewrites the plan to close every hole before saving.

> Re-read the plan you just wrote as if you are the implementer, not the planner. List every place where you had to make an assumption, every edge case not explicitly covered, every ambiguous term, and every decision you'd have to guess at if you had zero other context. Don't fix anything yet — just list the holes.

Reasoning: plans written for high-class models leave implicit gaps those models fill correctly. When the same plan is handed to a low-class model (Deepseek V4, Mimo 2.5) those gaps get filled with the weaker model's own taste — which is where the bugs live. Surfacing holes explicitly, then pinning them, lets a weak model implement with zero conception space.

---

## 04/08/2026 — Default payment method storage decision (P3-G)

PAGE_SPECS PAGE 12 and `docs/PHASE-3-OVERVIEW.md` both flagged this as TBD: store the "Default payment method" preference in the `profiles` table, or in Zustand/localStorage?

**Decision: `profiles.default_payment_method` (nullable text column, migration `scripts/migrations/20260804_default_payment_method.sql`).**

Reasoning:
- It's a durable per-user preference, not transient UI/draft state. TRD §4.2 reserves Zustand for UI state (modals, filters, selected range) — a "default" that's supposed to persist and follow the user is a different category.
- It needs to survive across devices/sessions the same way `base_currency` and `timezone` already do on `profiles` — Zustand's `persist` middleware is per-browser (localStorage), so a phone/desktop split would silently diverge.
- The spec requires it to pre-fill Quick Add's payment method chip. `lib/store.ts`'s `ensureDraftForOpen` now takes an optional `defaultPaymentMethod` param, applied only when seeding a fresh (non-dirty) draft — `quick-add-sheet.tsx` passes it from `useProfile().data?.default_payment_method`.

Reused the existing `paymentMethodSchema` enum (`lib/validations/transaction.ts`) for both the DB check constraint and server-side validation on update — same five values as `transactions.payment_method` (Cash/Card/Transfer/POS/Other), so no new enum surface.

---

## 12/08/2026 — Recurring nav placement + mobile top-bar refactor (P3 gate, shipped for verification)

**Problem:** `/recurring` existed but was unreachable through normal navigation. Not in the desktop
sidebar (`components/sidebar.tsx` had 6 items, missing Recurring), not in mobile bottom-nav
(`components/bottom-nav.tsx`), and not in the Clerk avatar dropdown. Only reachable via direct URL or
the `RecurringDueBanner` — which only renders when templates are already *due*. New users with zero
templates hit a discoverability deadlock: no banner → no link → no way to set up the first recurring
template without knowing the URL. `APP_FLOW.md §3.1` had always specified the desktop sidebar should
include Recurring; the sidebar was simply a bug.

**Tier reframe (from Victor's brainstorming docs):** Recurring is *config-tier*, not primary-nav
material on mobile — the same usage shape as Categories: set up once, then live via the due-banner
nudge. Its primary-vs-sub-page status is now **device-conditional**: it's sidebar-primary on desktop
and Settings-sub-page on mobile. Showing it at two different weights on the same screen would
contradict itself, so the Settings row is mobile-only and the sidebar item is desktop-only.

**Full design spec:** `docs/superpowers/specs/2026-08-12-recurring-nav-design.md`.
**Source brainstorming docs (Victor):** `~/Recurring_Page_Brainstorming.md`,
`~/Recurring_Fix_Continued.md`.

**Changes shipped:**
1. `components/sidebar.tsx` — added `RefreshCw` import and a `Recurring` nav item between Analytics
   and Settings (canonical APP_FLOW §1 route order). Now 7 items desktop.
2. `app/(app)/settings/page.tsx` — new **mobile-only** Recurring row (`md:hidden`) inserted after
   the Categories row, identical card treatment, `RefreshCw` icon. Settings order becomes
   Profile → Categories → Recurring → Preferences → Currency → Account. Subtitle copy updated to
   "Profile, categories, recurring, and preferences. More options in later phases."
3. `components/top-bar.tsx` — three coordinated changes:
   - New mobile-only Settings icon button (`<Link href="/settings">`, `md:hidden`) inserted between
     `ThemeToggle` and `UserButton`. Cluster now: Toggle → Settings → Avatar. Matches the
     `ThemeToggle` button style (44px mobile). Borrowed the `TransitionRow`-style active-stripe look
     implicitly via the existing Toggle style. Desktop unchanged (Settings lives in the sidebar).
   - Deleted the mobile-only `Settings` link from `UserButton.MenuItems` so the avatar dropdown is
     pure identity (Clerk defaults: manage account / sign out). Removes the AGENTS.md §1.3
     "empty MenuItems on desktop" hazard entirely (no MenuItems rendered at all).
   - Back-nav "fix-now": `isRoot` no longer the sole gate. Added `isDesktopPrimary` =
     `!isMobile && pathname === '/recurring'` so desktop `/recurring` shows the title (like the
     other sidebar-primary pages) instead of a back chevron. Mobile keeps the back chevron since
     `/recurring` is reached via Settings there. **Full route-classification pass deferred — see
     backlog item below.**
4. `components/dashboard/month-summary-card.tsx` — wrapped the "previous" word in
   `<span className="hidden md:inline">` so mobile shows just the ▲/▼ arrow (the word crowded the
   metric at 375px). Desktop unchanged.
5. `NOTES.md` — this entry; reference to the brainstorming docs preserved.

**Verification:** `npx tsc --noEmit` clean. `npm run lint` 0 errors, 4 pre-existing warnings (none
in touched files; the same 4 noted in the 29/07 entry). `npm run build` succeeds; all 13 routes
compile; `/` static.

**Out of scope — backlog (do NOT build now):**
- **Onboarding / first-run discoverability nudge** for Recurring — a surface that lights up when a
  user has zero recurring templates so they learn the feature exists without the due-banner having
  to be the only path. Logged here, not built this phase per phase-gate discipline. Touch when
  Phase 3 gate closes and the onboarding pass is scoped.
- **TopBar back-nav full rework** — replace the single boolean with breakpoint-aware route
  classification (two lists: primary vs sub-page per breakpoint) plus a session nav counter + safe
  `router.back()` fallback to per-page floors (Categories → `/settings`, Goal Detail → `/goals`,
  mobile Recurring → `/settings`, etc.). Today's `router.back()` can walk a deep-link visitor out
  of the app; the `isDesktopPrimary` guard above is a one-route patch, not a fix for the underlying
  class problem. Tracked here, not built this phase.

**Decision trail (from `~/Recurring_Fix_Continued.md` Q&A):**
- Q1 desktop redundancy → **mobile-only Settings row** (sidebar covers desktop).
- Q2 top-bar refactor scope → **ship together** with the placement.
- Q3 onboarding → **defer to backlog** (this entry).

---

## 12/08/2026 (later, same day) — Chevron fix shipped + Clerk data-bleed logged (addendum)

Two observations raised after the entry above shipped; both documented here so a fresh session can
pick them up from `NOTES.md`.

### Chevron vertical-center (shipped in commit `574c7bb`)
- **Source doc:** `~/Sidebar_Chevron_Placement.md` (full reasoning).
- **Problem:** the sidebar collapse chevron sat `top-6 -right-3` — pinned near the logo and, on
  collapsed-rail + sub-page, in the same top band as TopBar's back-chevron button. Two circular
  chevrons near the top-left = visual collision.
- **Fix shipped:** `components/sidebar.tsx` — `top-6` → `top-1/2 -translate-y-1/2`, `z-40` →
  `z-[10000]`. No new interaction model (rejected hover-reveal and click-anywhere-to-expand
  alternatives from that doc — consistent with the rest of the app's always-visible controls).
- **Worth a look at 375px/1280px:** at vertical-center the chevron can sit level with whichever nav
  icon is mid-list (Goals/Analytics) — it floats outside the rail at `-right-3` so no overlap, but
  confirm once in the browser.

### Clerk data-bleed bug (NEW — not built, backlog)
- **Observation:** sign out of one account (e.g. Krypto), sign into another (e.g. Spidey) in the
  same browser — the dashboard briefly shows the previous account's data before swapping to the new
  user's data. Reached via direct observation on 12/08/2026.
- **Why it's deferred:** Victor's direction is to do only what's required to close the Phase 3 gate
  now, then address all remaining items before Phase 4 is declared started. So this is **logged,
  not built** — do NOT fix during the gate.
- **Likely suspects to start the diagnosis (unverified):** TanStack Query cache not being cleared on
  `user_id` change (stale queries keyed without user scope, or `gcTime`/`staleTime` surviving the
  sign-in swap), plus Clerk `useUser()`/profile sync hydration racing the previous session's cached
  keys. Root cause not yet established — diagnose before fixing (AGENTS.md §1.8).
- **When to touch:** immediately after Phase 3 gate closes, before Phase 4 is declared started.

---

## 14/08/2026 — Page titles: "Ledger — Page" on every route (Victor request)

Every tab previously showed the full landing title (`Ledger — Personal Finance Tracker for Nigerian
Professionals`) on **all** pages. Fixed with the Next.js title template:

- `app/layout.tsx`: single `title` string → `title: { default: "Ledger — …Professionals", template: "Ledger — %s" }`.
  Landing `/` keeps the long text (inherits `default`); every child route that sets its own title
  renders `Ledger — <page>`.
- **Format (final):** product identity first — "Ledger", em dash, then the page (Stripe/Linear/Figma
  convention). No pipes ever. Same day the template first landed as "Ledger | %s", got inverted to
  "%s — Ledger", then Victor reversed it to product-first "Ledger — %s". Per-page `metadata.title`
  strings are bare page names only; the template supplies "Ledger — ".
- Per-page titles added (`export const metadata: Metadata = { title }`):
  Dashboard, Analytics, Transactions, Budgets, Goals, Recurring, Settings, Categories,
  Sign in, Sign up. Detail pages (`/transactions/[id]`, `/goals/[id]`) reuse Transactions/Goals.
- **Metadata is Server-Component-only in Next 16**, so pages that were `'use client'` became thin
  server pages (behavior unchanged — all interactive content lives in `components/` client children):
  - `transactions|budgets|goals|recurring|settings|settings/categories/page.tsx` — removed `'use client'`, added metadata.
  - `app/(app)/dashboard/page.tsx` — inline client code moved to new
    `components/dashboard/dashboard-view.tsx` (`DashboardPage` → `DashboardView`); page is now a
    server wrapper + `title: "Dashboard"`.
  - `transactions/[id]/page.tsx` + `goals/[id]/page.tsx` — server pages, `const { id } = await params`
    (was `use(params)`), same child components/props.
- `analytics/page.tsx`, `sign-in`, `sign-up` were already server components — metadata added only.

**Verification:** `npx tsc --noEmit` clean; `npm run lint` 0 errors (same 4 pre-existing warnings,
untouched); `npm run build` succeeds (13/13 routes, `/` ○ Static). Curled the production server:
`/` → long title, `/sign-in` → "Ledger — Sign in", `/sign-up` → "Ledger — Sign up". App routes
after sign-in — mechanism identical to sign-in/sign-up (proven), plus per-page strings are
type-checked and compiled. Confirm visually in a logged-in browser tab.

---

## 19/08/2026 — Webpack reverted, default payment method migration applied, Phase 3 gate audit

### Webpack decision reversal

The 12/08 migration to Turbopack-only (`next dev`) is **reversed**. Next 16.3 Turbopack is
technically stable but still produces slow compile times on Victor's machine; `npm run dev` is
back to `next dev --webpack`. Production build (`next build`) keeps Turbopack via Vercel.

- `AGENTS.md:84,113` updated. The "Do not re-add `--webpack`" rule is now "Do not remove `--webpack`
  from the dev script."
- `package.json` (the dirty worktree item from earlier) is now policy-aligned.
- `TRD.md` was already correct (`§1 row Dev server` + `§8 §9`); no edit needed.

### Default payment method migration applied (P3-G)

`scripts/migrations/20260804_default_payment_method.sql` — created 04/08, sitting in the repo but
not yet applied to Supabase. Applied today via `supabase db query --linked -f <path>` (the
Supabase CLI has no `db execute` in v2.113.0; `db query --linked -f` is the equivalent).

Verified post-apply:
- Column exists: `public.profiles.default_payment_method` — `text`, nullable, no default.
- CHECK constraint `profiles_default_payment_method_check` enforces
  `{Cash, Card, Transfer, POS, Other}` (same enum as `transactions.payment_method`).
- Migration is idempotent (`ADD COLUMN IF NOT EXISTS`) — safe re-runs.

Quick-add now persists your `default_payment_method` choice (Card by default per your current
Settings page) across devices, instead of silently resetting per-browser via Zustand.

### Phase 3 gate — Victor's verification pass (19/08/2026)

Victor walked through every gate item in `PHASES.md:287-297` and confirmed:

| Gate item | Status |
|---|---|
| Every route in APP_FLOW §1 renders | ✅ |
| Analytics shows real data, charts correct | ✅ |
| Recurring template → confirm → tx with `recurring_id` | ✅ |
| Currency widget ₦→USD/GBP/EUR | ✅ |
| Landing CTAs both work | ✅ |
| Production URL works (no 500) | ✅ |
| 30+ real transactions (50+ actual) | ✅ |

Open items: production-branch `tsc --noEmit` clean (unverified post-deploy), console errors in
production (judgement call), hiring-manager 60s gut check (judgement call). All three depend on
Victor's next browser pass; no code required.

### Landing-page screenshot inventory (catalogued 19/08/2026)

`~/Downloads/Ledger-sc/` — 13 PNGs (Aug 14 batch). Vision-checked:

| Coverage | Pages captured |
|---|---|
| **Mobile (375px)** | Dashboard only — **1/13**. ~12 pages missing mobile coverage. |
| **Landing** | Hero (desktop), Full (desktop) — 2 |
| **Dashboard** | 3 desktop variants (with/without due banner, with/without budgets+goals rail) |
| **Transactions** | 2 desktop (incl. full scroll) |
| **Goals** | 1 desktop |
| **Analytics** | 1 desktop (long) |
| **Recurring** | 1 desktop |
| **Settings** | 2 desktop (top, + currency widget) |
| **Missing desktop** | Budgets, Categories, Transaction Detail, Goal Detail, Sign-in, Sign-up |

Victor flagged mobile-first as the priority gap (he captured mostly desktop). Plan: reshoot ~12
mobile pages + the 6 missing desktop pages, then build a landing-page carousel from the mobile
set (the carousel replaces the "View Demo" concept — demo account removed 09/08, "View Demo" CTA
now misleading since it links to /sign-in).

### OG-image status

`app/layout.tsx` references `/og-image.png`. Currently absent from `public/` (verified by
directory listing). Needs capture after hero is finalized (Victor wants hero fixed first). 1200×630
standard, served as PNG/JPG, must render the headline + a real screenshot preview. Plan: capture
hero at production URL after hero fix lands, then export to `public/og-image.png`.

### Backlog (post-P3, not blocking)

- **Clerk data-bleed bug** (NOTES.md 12/08) — sign out/in briefly shows previous user's data.
  Root cause not yet diagnosed; suspected TanStack cache not clearing on `user_id` change +
  Clerk `useUser()`/profile-sync hydration racing.
- **TopBar back-nav full rework** — `isDesktopPrimary` is one-route patch; underlying class
  problem (router.back() can walk deep-link visitors out) not fixed.
- **Recurring `next_date` past-dated on create** — accepted but undocumented as intentional.
- **Recurring confirm/skip** — two sequential writes (no DB transaction); money + duplicate-tx
  risk on partial failure. Matches existing codebase pattern but flagged.

### Pending landing-page work (awaiting Victor approval)

- Hero page fix (before OG capture).
- Replace "View Demo" / 2-image preview with screenshot carousel/gallery from the mobile set.
- Capture hero screenshot at production URL → `public/og-image.png`.
- Mobile screenshot reshoot (~12 pages) + missing desktop pages (~6).

Plan to follow once Victor approves scope.

### Phase 3 gate closed (19/08/2026)

Per AGENTS.md §1.8, Victor confirmed gate items individually across this session:

- **Items 1–5** (routes, analytics, recurring, currency, landing CTAs + mobile + meta tags) — visually confirmed by Victor.
- **Item 6** (Vercel live + sign up + log tx + appears) — pre-existing, confirmed by Victor.
- **Items 7–8** (30+ trsx; tsc clean on prod branch) — confirmed by Victor; 50+ actual trsx logged; tsc is part of every agent's pre-push workflow per Victor.
- **Item 9** (zero console errors in production) — confirmed by Victor; the localhost Clerk API error is the expected dev-mode handshake warning, not a prod issue.
- **Item 10** (hiring-manager 60s gut check) — **deferred to Phase 4** at Victor's explicit direction. Treated as out-of-scope for P3.

`PHASES.md` gate checklist updated. `npx tsc --noEmit` clean on local main (19/08); `npm run lint` 0 errors, same 4 pre-existing warnings noted in earlier entries (budgets-view, category-form-sheet, goals-view, transactions.ts). No new findings from this session's verification.

Phase 4 is now unblocked. Per `PHASES.md:300-302`: PWA manifest + service worker + offline viewing, CSV export, light-mode value refinement (architecture already in place from Phase 0), Lighthouse audit, responsive polish, logo design, product tour, README via readme-generator.

### Pre-Phase-4 backlog carried forward (not closed by P3)

- **Clerk data-bleed** (12/08 NOTES.md) — sign out/in briefly shows previous user's data; root cause not yet diagnosed.
- **TopBar back-nav full rework** — `isDesktopPrimary` is one-route patch, not the class fix.
- **Recurring `next_date` past-dated** accepted on create (decision: intentional or bug? undecided).
- **Recurring confirm/skip** — two sequential writes, no DB transaction (duplicate-tx risk on partial failure).

### Mobile screenshot capture (post-P3)

Victor asked (19/08): 13 routes × 2 themes (dark + light) = 26 mobile screenshots at 375px, before landing-page polish lands. Flagged dark-screenshot-on-light-page aesthetic concern but said "let's just put a pin on it."

#### Auth blocker discovered 20/08/2026

Programmatic Clerk login does **not** work end-to-end against the production Vercel deploy: Clerk's sign-in form routes any "new device" through `/sign-in/client-trust`, which emails a 6-digit OTP. Headless Playwright contexts always look like new devices, and the OTP goes to Victor's email (the Spidey account's underlying address is `nbmichael97@gmail.com` per the masked value shown on the trust page). Without mailbox access there is no way for an agent to satisfy that step.

Workaround (chosen): reuse Victor's existing trusted session. Two-script flow:
- `scripts/export-storage-state.mjs` — connects to Victor's live Brave via Chrome DevTools Protocol (`--remote-debugging-port=9222`), opens a tab on `/dashboard`, confirms auth, writes cookies + localStorage to `scripts/storageState.json`.
- `scripts/capture-mobile-screenshots.mjs` — launches a fresh incognito Brave, loads the storageState, captures 13 routes × 2 themes = 26 PNGs at 375px into `public/mobile-{dark,light}-{route}.png`.

Both scripts share the same incognito-no-extensions convention as `~/.agents/playwright-core/clean-context.mjs`.

#### Captured 20/08/2026

Victor closed Brave, agent launched it with `--remote-debugging-port=9222`, exported storageState, and ran the capture script.

- 26 PNGs written to `public/mobile-{dark,light}-{route}.png` (375×812 @ 2x DPR, full viewport).
- All 13 routes × 2 themes captured. Auth succeeded via the Spidey Clerk session loaded from `scripts/storageState.json`.
- Sign-in / sign-up captured in a separate unauthenticated context so Clerk doesn't redirect them to /dashboard.
- Theme applied via `context.addInitScript` writing `localStorage['ledger-theme']` BEFORE the page's inline script in `app/layout.tsx` reads it — no flash, no theme drift.

Route list (13):
- `/sign-in`, `/sign-up` (public, logged-out)
- `/dashboard`, `/transactions`, `/transactions/a07b4f9e-8419-4535-91eb-a820c71e6636` (Aug 16 tx), `/budgets`, `/goals`, `/goals/fc94f197-8b86-4147-b15c-1b1f34b21f13` (Washing Machine), `/analytics`, `/recurring`, `/settings`, `/settings/categories`, `/` (landing) — all authenticated

Detail-route IDs sampled 19/08 from Supabase via service-role (most-recent transaction and an active Washing Machine goal).

#### Notes for Phase 4 integration

- The hero Naira glyph on the landing page (e.g. `Track every ₦.`) renders with subtle kerning artefacts at 375px — captured as-is. Phase 4 polish (or font tuning) may address.
- Sign-in screenshot still shows the orange "Development mode" badge at the bottom — that's a Clerk instance-level message (this project is on a dev Clerk instance, `included-mallard-13.accounts.dev`), not a theme artifact. Will go away once the Clerk instance is upgraded to production; out of scope here.
- Files are not yet committed. Awaiting Victor's call: commit + integrate into a landing-page carousel (P4), or leave them as raw assets.
- Victor's flagged dark-screenshot-on-light-page aesthetic concern is **still open** — Phase 4 must decide treatment before publishing the captures anywhere.

Spidey creds (`Spidey` / `KrispyK40!`) were provided as a fallback during exploration; the storageState path made them unnecessary.

## 24/08/2026 — Phase 4 PWA implemented (manifest + service worker + offline)

Executed `docs/P4-PWA-PLAN.md` (the durable execution artifact — read it for the full record incl. deviations).

- Manifest (`app/manifest.ts`), iOS standalone meta + viewport (`app/layout.tsx` appleWebApp / themeColor), service worker (`app/sw.ts` + `app/serwist/[path]/route.ts`), offline fallback page (`app/~offline`).
- Offline data: TanStack Query cache persisted per-user to localStorage (`ledger-query-cache-<clerkUserId>`) and hydrated on boot — implemented manually in `components/providers.tsx` (NOT `PersistQueryClientProvider`, which can't re-key per user after mount). Added `refetchOnMount: () => navigator.onLine` so offline boot renders the cached data instead of an error state.
- SW: `@serwist/turbopack` (works under Next 16.3 Turbopack), `skipWaiting`+`clientsClaim`, NetworkOnly for POST server-actions + Clerk hosts, precache scoped to app shell + icons (excludes the untracked `mobile-*.png` screenshots).
- Icons 192/512/maskable generated via `scripts/generate-pwa-icons.mjs` replicating the apple-touch composition.
- Deps added: `@serwist/turbopack`, `@serwist/window`, `serwist`, `@tanstack/react-query-persist-client`, `@tanstack/query-sync-storage-persister`; dev `esbuild`; `@tanstack/react-query` bumped to `^5.102.2`.

Verification: `tsc`, `lint`, `build` all pass. Runtime (next start + Playwright/Brave): SW registers/activates/controls, precache correct, offline reload of visited page works, `/~offline` fallback works, SW headers + manifest + head tags correct.

**BLOCKED — not yet verified:** authenticated offline dashboard render. Spidey sign-in now hits Clerk `client-trust` requiring an emailed verification code (can't receive in this environment); no `scripts/storageState.json` available. Also unverified: iOS standalone launch, Android install prompt, cross-user cache check (device/prod only). TODO for a later session or Victor's device: `next build && next start`, sign in once, force offline, reload `/dashboard` → must render last-viewed dashboard + recent transactions.

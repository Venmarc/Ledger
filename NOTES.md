# DEV_NOTES

## CREATED: 05/07/2026

## LAST UPDATED: 09/08/2026 (Gate 1 landing page remediation — IN PROGRESS, checkpoint below)

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

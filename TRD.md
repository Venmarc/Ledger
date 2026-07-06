# TRD.md — Technical Requirements Document
**Project:** Ledger
**Last Updated:** 05/07/2026
**Status:** Pre-build. Docs phase.
 
**References:** PRD.md · SCHEMA.md · PHASES.md · NOTES.md
 
---
 
## 1. Tech Stack
 
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | File-based routing, RSC, Vercel-native |
| Language | TypeScript (strict) | No `any`. No exceptions. |
| Auth | Clerk | Polished UI, social logins, Custom Session Tokens |
| Database | Supabase (PostgreSQL) | RLS, realtime, familiar SQL |
| Styling | Tailwind CSS + shadcn/ui | Speed + consistency |
| State | Zustand + TanStack Query | Local UI state + server state separately |
| Forms | React Hook Form + Zod | Validation at schema level |
| Charts | Recharts | Sufficient for v1 analytics. Tremor dropped — unnecessary abstraction layer |
| Dates | date-fns | Lightweight. Luxon dropped — overkill for a single timezone app |
| Dev server | `next dev --webpack` | Turbopack unstable on this machine. Vercel deploy still uses Turbopack |
| Deployment | Vercel | Zero config for Next.js |
| PWA | Post-August only | See PHASES.md |
 
---
 
## 2. Clerk + Supabase Integration
 
This is the most failure-prone part of the stack. Follow this exactly.
 
### 2.1 Auth Strategy
- **Custom Session Tokens** — not webhooks. Faster, more reliable, fewer moving parts.
- Clerk issues a JWT. Supabase reads it. No sync job needed for auth.
### 2.2 ID Storage — Critical
- `clerk_id` stored as **`text`** in all Supabase tables. Never `uuid`.
- All `user_id` foreign key columns stored as **`text`**. Never `uuid`.
- Supabase does not accept Clerk user IDs as `uuid` — they are prefixed strings (e.g. `user_2abc...`). Storing as `uuid` will cause silent failures or hard errors.
### 2.3 RLS Policy Pattern
All Row Level Security policies must use:
```sql
auth.jwt() ->> 'sub'
```
Not `auth.uid()`. `auth.uid()` returns a Supabase auth UUID which does not exist when using Clerk. Every RLS policy that uses `auth.uid()` will silently block all access.
 
Correct pattern:
```sql
create policy "Users can only access their own data"
  on transactions for all
  using ((auth.jwt() ->> 'sub') = user_id);
```
 
### 2.4 Profile Sync
- On first sign-in, upsert a row in `public.profiles` using the Clerk user ID.
- Done via a Next.js API route or middleware — not a Supabase webhook.
- Profile contains: `clerk_id` (text), `full_name`, `avatar_url`, `base_currency` (default `NGN`), `timezone` (default `Africa/Lagos`).
---
 
## 3. Data Architecture
 
### 3.1 Money
- All amounts stored as `numeric(15,2)`. Not `integer`. Not `float`.
- `integer` (kobo/cents) rejected: requires conversion everywhere, adds bugs at the display layer.
- `float` rejected: floating point errors on financial data are unacceptable.
- `numeric(15,2)` is precise, readable, and correct.
### 3.2 Currency
- The app is **NGN-only** at the data layer.
- Every `amount` field and every `budget` field is in ₦.
- No `exchange_rates` table. No conversion logic in the database.
- The currency reference widget (see PRD.md §4.8) is a stateless UI utility. It does not touch the database.
### 3.3 Timezone
- All timestamps stored in UTC (Supabase default).
- All display formatting uses `Africa/Lagos` timezone.
- `date-fns` handles all formatting. No raw JS `Date` manipulation in components.
### 3.4 Database Access
- Direct Supabase client calls from server components and API routes. No custom API abstraction layer in v1.
- All mutations go through server actions or API routes — never direct client-side Supabase calls for writes.
- Reads from client components are allowed via TanStack Query + Supabase client.
### 3.5 Indexes (Non-negotiable)
```sql
create index idx_transactions_user_date on transactions(user_id, transaction_date desc);
create index idx_transactions_category on transactions(category_id);
create index idx_budgets_user_period on budgets(user_id, period, start_date);
```
Without these, the dashboard and transaction list will degrade on real data volume.
 
---
 
## 4. Frontend Architecture
 
### 4.1 Routing Structure
```
app/
  (public)/
    page.tsx              # Landing page
  (auth)/
    sign-in/
    sign-up/
  (app)/                  # All protected routes
    layout.tsx            # Sidebar (desktop) + bottom nav (mobile)
    dashboard/
    transactions/
    budgets/
    goals/
    analytics/
    recurring/
    settings/
```
 
### 4.2 State Rules
- **Server state** (transactions, budgets, goals): TanStack Query. Cache aggressively. Invalidate on mutation.
- **UI state** (modals, filters, selected date range): Zustand.
- **Form state**: React Hook Form. Zod schema validation. Never manage form state manually.
### 4.3 Mutations — Optimistic Updates Required
Every create, update, and delete must:
1. Apply change to local cache immediately (optimistic update).
2. Fire the server call.
3. On success: confirm. On failure: rollback + toast error.
No mutation is allowed to make the user wait for a spinner before seeing feedback. This is a finance app — users need to trust that their action registered.
 
### 4.4 Client-Side Draft Persistence
- The quick-add transaction form must survive accidental reloads, tab closures, and navigation away.
- Implemented via **Zustand `persist` middleware** writing draft state to `localStorage`.
- Persisted draft fields: `amount`, `category_id`, `payment_method`, `description`, `notes`, `tags`, `transaction_date`.
- Draft is cleared on two events only: successful form submission, or explicit user discard.
- No database call involved. This is entirely client-side. Schema has no part in this.
- No other form in the app requires draft persistence in v1 — only quick-add, because it is the highest-frequency, highest-friction-risk flow.
### 4.5 Component Standards
 
Every public component must handle three states explicitly:
- **Loading** — skeleton, not a spinner where possible.
- **Error** — error boundary or inline error with retry.
- **Empty** — useful empty state, not a blank screen.
If a component doesn't handle all three, it is incomplete.
 
---
 
## 5. Quality Constitution
 
These are not guidelines. Violations are bugs.
 
### 5.1 TypeScript
- Strict mode. No `any`. No `@ts-ignore` without an explicit comment explaining why.
- All API responses typed. All Supabase query results typed via generated types.
- Run `tsc --noEmit` before every commit. CI must pass.
### 5.2 Currency Display
- All ₦ amounts formatted via `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`.
- No manual string concatenation for currency display (`"₦" + amount` is banned).
- Wrap in a shared `formatNGN(amount: number): string` utility used everywhere.
### 5.3 No Magic Numbers
```ts
// Wrong
if (percentage > 75) { ... }
 
// Right
const BUDGET_WARNING_THRESHOLD = 0.75;
if (percentage > BUDGET_WARNING_THRESHOLD) { ... }
```
 
### 5.4 No Commented-Out Code in Main/Production
Dead code goes to the bin. If you might need it later, that's what git history is for.
 
### 5.5 Performance Floor
- Dashboard must feel instant on 3+ years of data. Paginate and aggregate at the database level — never in JS.
- Transaction list uses infinite scroll or pagination. Never load all rows.
- No `useEffect` for data fetching. That's TanStack Query's job.
### 5.6 Accessibility Minimum
- All form inputs have labels (not just placeholders).
- All icon-only buttons have `aria-label`.
- Color alone never conveys meaning (budget red/green also has text labels).
---
 
## 6. Design Constitution
 
### 6.1 Theme
- Dark mode is the **default and primary** theme.
- Light mode support added at project start via Tailwind `dark:` classes and a theme provider — not retrofitted later. Retrofitting breaks agents and wastes hours.
- CSS variables for all colors. Never hardcode hex values in components.
### 6.2 Color Semantics
| Meaning | Color |
|---|---|
| Income / positive / under budget | Green |
| Warning / approaching budget limit (≥75%) | Amber |
| Expense / overspent / loss | Red |
| Neutral / primary UI | Defined in UI/UX_BRIEF.md |
 
These mappings are universal across the app. No exceptions.
 
### 6.3 Mobile-First
- Every screen designed for 375px width first.
- Desktop layout adds sidebar and expands — it does not replace the mobile layout.
- Bottom navigation on mobile. Sidebar on desktop (≥768px).
- Touch targets minimum 44×44px.
### 6.4 Speed Feel
- Quick-add transaction: floating button → form → saved in under 10 seconds. This is a product requirement, not a preference.
- Transitions and animations must be functional, not decorative. If an animation adds more than 150ms to a perceived interaction, cut it.
---
 
## 7. Rejected Decisions
 
| Option | Rejected Because |
|---|---|
| Firebase | Weak relational querying. Aggregations are painful. |
| Custom backend (Express/Hapi) | Slower development. Supabase is sufficient for v1. |
| Prisma ORM | Adds abstraction over Supabase that conflicts with RLS patterns. |
| Turbopack in dev | Unstable on current machine. Webpack is slower but reliable. |
| Luxon | Overkill for a single-timezone app. date-fns is sufficient. |
| Tremor | Unnecessary abstraction over Recharts. Recharts directly gives more control. |
| Multi-currency data layer | Adds schema complexity with no personal benefit. NGN-only. |
| Webhook-based Clerk→Supabase sync | Slower, more failure points than Custom Session Tokens. |
| Rollover budgets | Adds complexity. Debt from a bad month should not silently carry forward. |
| Auto-posting recurring transactions | User must always confirm. Silent auto-posts erode trust in the data. |
 
---
 
## 8. Environment Variables
 
All required variables. Document in `.env.example`. Never commit real values.
 
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
 
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
 
# Currency Widget (public API — e.g. exchangerate-api.com or frankfurter.app)
NEXT_PUBLIC_CURRENCY_API_URL=
```
 
---
 
## 9. What an Agent Building This Must Never Do
 
- Change `user_id` column type to `uuid`. It is `text`. This is not negotiable.
- Use `auth.uid()` in RLS policies. It must be `auth.jwt() ->> 'sub'`.
- Add multi-currency logic to transactions, budgets, or goals. Currency widget is UI-only.
- Auto-post recurring transactions without user confirmation.
- Use `float` or `double precision` for any monetary column.
- Add features not listed in PRD.md §4 without documenting the decision in NOTES.md first.
- Use Turbopack in the dev server command.
- Hardcode hex colors in components — use CSS variables.
- Add rollover logic to budgets.
---
 
*This document governs all technical decisions. When a conflict arises between convenience and these rules, these rules win. Document deviations in NOTES.md with a timestamp and reason.*

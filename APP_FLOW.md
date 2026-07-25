# APP_FLOW.md — User Journey & Navigation
**Project:** Ledger
**Last Updated:** 05/07/2026
**Status:** Pre-build. Docs phase.
 
**References:** PRD.md · TRD.md · PAGE_SPECS.md · UI/UX_BRIEF.md · PHASES.md · NOTES.md
 
---
 
## 1. Route Map
 
```
/                          → Landing page (public)
/sign-in                   → Clerk sign-in (public)
/sign-up                   → Clerk sign-up (public)
 
/dashboard                 → Protected. Default redirect after auth.
/transactions              → Protected. Full transaction list.
/transactions/[id]         → Protected. Single transaction edit view.
/budgets                   → Protected. Budget list and progress.
/goals                     → Protected. Savings goals list.
/goals/[id]                → Protected. Single goal detail + contribution log.
/analytics                 → Protected. Charts and spending insights.
/recurring                 → Protected. Recurring template list.
/settings                  → Protected. Profile, categories, preferences.
/settings/categories       → Protected. Category management.
```
 
**Auth middleware** intercepts every `/dashboard`, `/transactions`, `/budgets`, `/goals`, `/analytics`, `/recurring`, and `/settings` route. Unauthenticated requests redirect to `/sign-in` with a `redirect_url` param so the user lands where they intended after login.
 
---
 
## 2. Authentication Flows
 
### 2.1 New User
```
/ (landing)
  → clicks "Get Started" or "Sign Up"
  → /sign-up (Clerk hosted UI)
  → completes sign-up
  → Clerk fires session
  → Next.js middleware runs profile upsert (clerk_id → profiles table)
  → redirect to /dashboard
  → dashboard renders with full empty states + onboarding prompt
```
 
Onboarding prompt is a single inline banner on the dashboard — not a separate page, not a multi-step wizard. It says: "Add your first transaction to get started." One action. Nothing else.
 
### 2.2 Returning User
```
any URL
  → middleware checks Clerk session
  → valid session → render page
  → no session → /sign-in?redirect_url=[original_url]
  → signs in → redirected to original_url
```
 
### 2.3 Sign Out
```
Settings → "Sign out"
  → Clerk signs out
  → redirect to /
```
 
---
 
## 3. Global UI Elements
 
Present across the app. Some are protected-only (nav, FAB, recurring banner); the theme toggle spans public and protected pages.
 
### 3.1 Navigation
- **Mobile (< 768px):** Bottom navigation bar with 5 items: Dashboard, Transactions, Budgets, Goals, Analytics. Settings accessible via profile avatar top-right.
- **Desktop (≥ 768px):** Left sidebar with all nav items including Recurring and Settings.
### 3.2 Theme Toggle
- Present on every page — public and protected, mobile and desktop. Not confined to Settings.
- **Placement rule:** sits at the position closest to center among any cluster of top-bar icons/buttons on that side. Every other icon or button (avatar, hamburger, notification bell, CTA button) sits further toward the corner than the toggle. The toggle is always the first thing encountered moving outward from center — never the last.
- **Mobile:** top bar, right side. Toggle innermost (closest to center), other elements pushed outward toward the corner.
- **Desktop:** same rule applies to whatever top-bar cluster exists on that page (e.g. landing nav: Toggle → GitHub link → View Demo button, with View Demo at the far corner as the primary CTA).
- Icon: sun (light mode active) / moon (dark mode active) — see UI/UX_BRIEF.md §6.10 for exact component spec.
- **Functional from Phase 0.** This is not a placeholder swapped out later — see PHASES.md Phase 0. Only the underlying light-mode color values get refined in Phase 4, not the toggle mechanism itself.
- Tapping toggles `data-theme` between `"dark"` and `"light"` and persists the choice to `localStorage` under key `ledger-theme`.
- **Default on first visit** (no stored preference): always `"dark"`, regardless of the device's OS-level light/dark setting. Ledger does not read `prefers-color-scheme`. This is deliberate — a hiring manager viewing the demo on a light-mode laptop should still see the intended dark aesthetic first, and choose light explicitly if they want it.
- See TRD.md §6.1 for the flash-prevention requirement on page load.
### 3.3 Back Navigation Pattern

Two distinct classes of page. Do not apply back navigation uniformly across both.

**Primary nav destinations** — Dashboard, Transactions, Budgets, Goals, Analytics,
Recurring, Settings. These are reachable directly via bottom nav (mobile) or sidebar
(desktop). They NEVER show a back button or back link in their page header. Adding
one implies a false hierarchy — the user did not drill down to get here, they
navigated directly.

**Sub-pages** — pages one level below a primary nav destination, not directly
reachable from nav: Goal Detail (/goals/[id]), Category Management
(/settings/categories), Transaction Edit when accessed via direct URL
(/transactions/[id]). These DO show a back affordance: a plain icon-only chevron
(no text label), positioned top-left of the page header, returning to the parent
page.

If you are building a page and unsure which class it belongs to: does it appear
as an item in the bottom nav or sidebar? If yes, it is a primary destination —
no back button. If no, it is a sub-page — icon-only chevron back button.
### 3.4 Floating Action Button (FAB)
- Present on every protected page except Settings.
- Position: bottom-right, above bottom nav on mobile.
- Single tap → opens Quick Add sheet.
- This is the primary entry point for logging. It must be reachable with one thumb from any screen.
### 3.5 Recurring Due Banner
- Appears at top of Dashboard when one or more recurring templates have `next_date <= today`.
- Shows count: "2 recurring transactions are due."
- Tapping navigates to /recurring filtered to due items.
- Dismissible per session only — reappears on next visit if still unconfirmed.
---
 
## 4. Core User Flows
 
### FLOW 1 — Quick Add Transaction (Primary Flow)
This is the most important flow in the app. Every friction point here is a product failure.
 
```
User taps FAB (any screen)
  → Bottom sheet slides up
  → Form fields in order:
      1. Amount (₦) — numeric keyboard, auto-focused
      2. Type toggle — Income / Expense (default: Expense)
      3. Category — scrollable pill selector, most-used categories first. Each pill: Lucide icon (neutral background at rest) + category name. Selected pill gets an orange (`--color-orange`) border ring — this pattern is already correctly implemented in the live build; codify it here so it isn't reinvented differently elsewhere.
      4. Payment Method — Cash / Card / Transfer / POS / Other
      5. Date — defaults to today, tappable to change
      6. Description — optional, single line
      [Advanced toggle → reveals Notes and Tags]
  → User taps "Save"
  → Optimistic update: transaction appears in recent list instantly
  → Sheet closes
  → Success toast: "₦X,XXX logged to [Category]"
  → Server confirms in background
 
If server fails:
  → Toast error: "Failed to save. Tap to retry."
  → Transaction removed from optimistic list
  → Sheet reopens with data intact (draft recovery)
 
If user closes sheet without saving:
  → If any field has been touched → draft saved to localStorage via Zustand
  → Next FAB tap → sheet opens with draft restored
  → Small "Draft restored" label visible above form
  → Discard button clears draft explicitly
```
 
**Target: tap FAB → saved → sheet closed in under 10 seconds.**
 
---
 
### FLOW 2 — View & Manage Transactions
 
```
/transactions
  → Full list, paginated (20 per page / infinite scroll)
  → Default sort: transaction_date desc
  → Filter bar (sticky top):
      - Date range picker (default: current month)
      - Category multi-select
      - Type toggle (All / Income / Expense)
      - Payment method filter
      - Search (description text match)
  → Each row shows: date, category icon+name, description, amount, type indicator
 
Tap a transaction row:
  → Edit sheet slides up (same layout as Quick Add, fields pre-filled)
  → User edits fields → Save
  → Optimistic update applied
  → Server confirms
 
Delete a transaction:
  → Swipe left on row (mobile) / three-dot menu (desktop) → "Delete"
  → Confirmation dialog: "Delete this ₦X,XXX transaction? This cannot be undone."
  → Confirm → optimistic removal → server delete
  → Undo toast for 5 seconds: "Deleted. Undo?" → tap restores
```
 
---
 
### FLOW 3 — Budgets
 
```
/budgets
  → Shows current month's budgets by default
  → Month selector at top to view past months (read-only for past)
  → Each budget card shows:
      - Category name + icon
      - Amount spent / budget limit
      - Progress bar (green → amber at 75% → red at 100%+)
      - Amount remaining (or amount over)
  → Empty state: "No budgets set for [Month]. Add one."
 
Add budget:
  → "+ Add Budget" button
  → Sheet: select category, enter ₦ amount
  → Save → card appears immediately (optimistic)
 
Edit budget:
  → Tap budget card → edit sheet pre-filled
  → Save or delete
 
No rollover. Past months are read-only history.
```
 
---
 
### FLOW 4 — Savings Goals
 
```
/goals
  → Grid of goal cards, active goals first
  → Each card shows: title, progress ring, ₦current / ₦target, % complete, target date if set
  → Completed goals (current >= target) shown below active, visually distinct
 
Add goal:
  → "+ New Goal" button
  → Sheet: title (required), target amount (required), target date (optional), description (optional)
  → Save → card appears
 
Tap a goal card:
  → /goals/[id]
  → Full detail: progress ring, contribution history, target info
  → "+ Log Contribution" button
      → Sheet: amount, date (default today), optional note
      → Save → current_amount incremented → ring updates
  → "Mark Complete" button (appears when current >= target OR manual override)
  → "Archive" to remove from active list without deleting
 
Delete goal:
  → From detail page, destructive action, confirmation required
```
 
---
 
### FLOW 5 — Analytics
 
```
/analytics
  → No user input needed on load. Reads from existing transaction data.
  → Month selector at top (default: current month)
  → Sections in order:
      1. Spending by category (bar chart + breakdown table)
      2. Income vs Expenses (summary numbers + bar)
      3. Month-over-month comparison (current vs previous month)
      4. Top 5 spending categories this month
      5. Money Leaks — categories over budget 2+ months in a row
      6. Daily spending trend (line chart for current month)
  → Empty state if < 5 transactions: "Add more transactions to see insights."
```
 
---
 
### FLOW 6 — Recurring Transactions
 
```
/recurring
  → List of active templates
  → Each row shows: description, category, amount, frequency, next due date
  → Due items (next_date <= today) shown at top with highlight
 
Add template:
  → "+ New Recurring" button
  → Sheet: description, category, amount, type, frequency, first occurrence date
  → Save → appears in list
 
Confirm a due recurring:
  → Tap "Confirm" on due item
  → Creates a real transaction row with recurring_id linked
  → Advances next_date by frequency interval
  → Removed from "due" highlight
 
Skip a due recurring:
  → Tap "Skip"
  → next_date advances, no transaction created
  → Logged as skipped (future: visible in template history)
 
Edit template:
  → Tap template row → edit sheet
  → Changes affect future occurrences only
 
Deactivate template:
  → Toggle off → removed from due checks, stays in list as inactive
```
 
---
 
### FLOW 7 — Currency Reference Widget
 
```
Accessible from: Dashboard (collapsible card) or Settings
  → Enter ₦ amount
  → Displays equivalent in USD, GBP, EUR using fetched rate
  → Rate source and last-fetched time shown
  → If API fails: "Rate unavailable. Check your connection."
  → No data stored. No transaction created. Purely informational.
```
 
---
 
### FLOW 8 — Settings
 
```
/settings
  → Profile section: avatar, full name (read from Clerk, not editable here — Clerk handles it)
  → Preferences: default payment method
  → Danger zone: Sign out
 
/settings/categories
  → List of all categories (default + user-created)
  → Add new category: name, type (income/expense), color, icon
  → Rename: tap name → inline edit
  → Archive: swipe or menu → confirm
  → Cannot delete categories with linked transactions (constraint enforced at DB level)
  → Cannot delete default categories — archive only
```
 
---
 
## 5. Empty States
 
Every screen must have a defined empty state. No blank screens.
 
| Screen | Empty State Message | Primary Action |
|---|---|---|
| Dashboard | "No transactions yet. Start logging." | FAB |
| Transactions | "No transactions match your filters." | Clear filters |
| Budgets | "No budgets for this month." | + Add Budget |
| Goals | "No savings goals yet." | + New Goal |
| Analytics | "Add more transactions to unlock insights." (< 5 transactions) | FAB |
| Recurring | "No recurring templates." | + New Recurring |
 
---
 
## 6. Error States
 
| Scenario | Behavior |
|---|---|
| Failed transaction save | Rollback optimistic update. Toast with retry. Sheet reopens with data. |
| Failed budget save | Rollback. Toast with retry. |
| Supabase query error | Inline error in affected component. Retry button. App does not crash. |
| Currency widget API failure | Widget shows "Rate unavailable." Rest of app unaffected. |
| Auth session expired | Middleware catches it. Redirect to /sign-in with redirect_url. |
| RLS policy blocks request | Treated as a 403. Log to console. Show generic error to user. Never expose policy details. |
 
---
 
## 7. Page Inventory for PAGE_SPECS.md
 
Every page listed below must have a full spec in PAGE_SPECS.md.
 
| Page | Route | Type |
|---|---|---|
| Landing | / | Public |
| Sign In | /sign-in | Public |
| Sign Up | /sign-up | Public |
| Dashboard | /dashboard | Protected |
| Transactions | /transactions | Protected |
| Transaction Edit | /transactions/[id] | Protected |
| Budgets | /budgets | Protected |
| Goals | /goals | Protected |
| Goal Detail | /goals/[id] | Protected |
| Analytics | /analytics | Protected |
| Recurring | /recurring | Protected |
| Settings | /settings | Protected |
| Category Management | /settings/categories | Protected |
 
---
 
*Every flow defined here maps directly to a page spec in PAGE_SPECS.md. If a flow is added or changed, PAGE_SPECS.md must be updated in the same session. These two documents are tightly coupled.*

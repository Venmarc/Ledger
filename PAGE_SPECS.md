# PAGE_SPECS.md — Page Layouts, Structure & Behavior
**Project:** Ledger
**Last Updated:** 05/07/2026
**Status:** Pre-build. Docs phase.
 
**References:** PRD.md · TRD.md · APP_FLOW.md · UI/UX_BRIEF.md · SCHEMA.md · PHASES.md · NOTES.md
 
---
 
## How to Read This Document
 
Every page in Ledger is fully defined here. For each page:
- **Purpose** — why it exists and what it must accomplish
- **Meta** — SEO/head tags where applicable
- **Layout** — mobile-first, then desktop additions
- **Sections** — every component, its content, its behavior
- **States** — loading, empty, error for every data-dependent section
- **Behavior Notes** — edge cases, interactions, rules
An agent building any page must be able to construct it precisely from this document alone without asking questions. If something is unclear here, it is a doc bug — fix it before building.
 
---
 
---
 
# PAGE 1 — Landing Page
**Route:** `/`
**Type:** Public
**App Flow Ref:** §2.1
 
---
 
## Purpose
Portfolio front door. Communicates what Ledger is, why it was built, and what it does — to a hiring manager who has 90 seconds. Not a product pitch. Not a SaaS landing page. A clear, credible project showcase.
 
---
 
## Meta / SEO
```html
<title>Ledger — Personal Finance Tracker for Nigerian Professionals</title>
<meta name="description" content="An open-source personal finance tracker built for NGN-first expense tracking, budgeting, and savings goals. Built with Next.js, Supabase, and Clerk." />
<meta property="og:title" content="Ledger" />
<meta property="og:description" content="Track every ₦. Kill bad spending. Build financial clarity." />
<meta property="og:image" content="/og-image.png" />
<link rel="canonical" href="https://ledger-demo.vercel.app" />
```
 
Structured enough that an LLM given the URL understands: what it is, who built it, what stack it uses.
 
---
 
## Layout — Mobile
Single column. Full-width sections stacked vertically.
 
```
[NAV BAR]
[HERO]
[FEATURES]
[TECH STACK]
[PREVIEW / SCREENSHOT]
[CTA STRIP]
[FOOTER]
```
 
---
 
## Layout — Desktop
Same sections, wider content container (max-width: 1100px, centered). Some sections switch to 2-column grid.
 
---
 
## Sections
 
### NAV BAR
- Logo left: "Ledger" wordmark.
- Right: Theme Toggle → "GitHub" link (icon + text) → "View Demo" button (primary). Toggle sits closest to center, View Demo sits at the far corner as the primary CTA. See APP_FLOW.md §3.2 for the placement rule.
- Sticky. Transparent on scroll-top, solid dark background on scroll.
- No hamburger menu. No nav links. Toggle + two actions only.
### HERO
- Headline: "Track every ₦. Kill bad spending. Build financial clarity."
- Subheadline (1-2 sentences): What Ledger is and who it's for. No marketing fluff.
  - Example: "A personal finance tracker built for Nigerian realities. NGN-first, mobile-first, fast transaction logging, and deep spending insights."
- Two CTAs: "View Live Demo" (primary button) + "View on GitHub" (ghost button).
- Optional: single dashboard screenshot or mockup below CTA. If no screenshot yet, use a placeholder with correct dimensions (do not ship with Lorem Ipsum placeholders — use realistic Nigerian data in any screenshot).
- Desktop: text left, image right (50/50 grid).
### FEATURES
- Section heading: "What it does"
- 6 feature tiles in a 2-column (mobile) / 3-column (desktop) grid.
- Each tile: icon, title, one sentence description.
| Icon | Title | Description |
|---|---|---|
| ⚡ | Lightning-fast logging | Add income or expenses in under 10 seconds via the floating action button. |
| 📊 | Budget tracking | Set monthly budgets per category. Watch them update in real time as you spend. |
| 🎯 | Savings goals | Set a target, log contributions, watch the progress ring fill. |
| 🔍 | Spending analytics | Category breakdowns, month-over-month comparison, and money leak detection. |
| 🔁 | Recurring transactions | Templates for salary, subscriptions, and regular expenses with due-date prompts. |
| 📱 | Mobile-first PWA | Installable on your phone. Built to be used daily, not demoed once. |
 
### TECH STACK
- Section heading: "Tech Stack"
- Simple horizontal pill list or icon grid: Next.js · TypeScript · Supabase · Clerk · Tailwind CSS · shadcn/ui · Recharts · TanStack Query · Zustand · Vercel
- No explanations. Engineers know what the list means.
### PREVIEW / SCREENSHOT
- One or two app screenshots showing the dashboard and quick-add flow.
- Realistic Nigerian data visible: ₦12,400 Transport, ₦8,200 Feeding, etc.
- Caption: "Dashboard showing real spending data"
- If screenshots not ready at launch: use a dark placeholder card with "Screenshot coming soon" — do not ship broken images.
### CTA STRIP
- Dark background section.
- Heading: "See it in action"
- Two buttons: "View Demo" (primary) + "GitHub Repo" (ghost)
- One line below: "Built by Venmarc · Open source · No sign-up required for demo"
### FOOTER
- Left: "Ledger — Built by Venmarc"
- Right: GitHub icon link
- One line only. No legal pages, no links, no newsletter.
---
 
## Behavior Notes
- No authentication logic on this page. If user is already signed in, do not redirect. They can use the nav to go to the demo.
- Page must load with no JavaScript for above-the-fold content. Static generation (`export const dynamic = 'force-static'`).
- No animations that delay content visibility. Transitions only on hover states.
---
 
---
 
# PAGE 2 — Sign In
**Route:** `/sign-in`
**Type:** Public
**App Flow Ref:** §2.2
 
---
 
## Purpose
Authenticate returning users. Handled entirely by Clerk. Ledger provides only the wrapper.
 
---
 
## Layout — Mobile & Desktop
Centered card on a dark background. No sidebar. No nav.
 
```
[LOGO — top center]
[CLERK <SignIn /> COMPONENT]
[Back to home link — bottom]
```
 
---
 
## Sections
 
### LOGO
- "Ledger" wordmark, centered, above the Clerk card.
- Links to `/`.
### CLERK SIGN IN COMPONENT
- `<SignIn />` from `@clerk/nextjs`.
- `afterSignInUrl="/dashboard"`.
- `redirectUrl` param respected — if user was redirected from a protected page, they land back there after sign-in.
- Clerk handles all: email/password, OAuth, error states, password reset.
- Do not build a custom auth form.
### BACK LINK
- "← Back to home" text link below the card.
- Links to `/`.
---
 
## Behavior Notes
- If user is already signed in, middleware redirects to `/dashboard` before this page renders.
- No custom error handling needed — Clerk handles all auth errors.
---
 
---
 
# PAGE 3 — Sign Up
**Route:** `/sign-up`
**Type:** Public
**App Flow Ref:** §2.1
 
---
 
## Purpose
Register new users. Clerk handles everything. Same wrapper pattern as sign-in.
 
---
 
## Layout
Identical structure to Sign In. Replace `<SignIn />` with `<SignUp />` and `afterSignUpUrl="/dashboard"`.
 
---
 
## Behavior Notes
- After successful sign-up, middleware runs profile upsert before /dashboard renders.
- If profile upsert fails (Supabase unreachable), user still lands on dashboard — profile upsert retries on next protected page load. App does not block on a failed upsert.
---
 
---
 
# PAGE 4 — Dashboard
**Route:** `/dashboard`
**Type:** Protected
**App Flow Ref:** §3.3, §4 (FLOW 7)
 
---
 
## Purpose
Command center. At a glance: how this month is going, what needs attention, recent activity, goal progress. Not a data dump — a decision surface. The user should look at this and immediately know if they're okay or in trouble.
 
---
 
## Layout — Mobile
Single column, scrollable.
 
```
[HEADER]
[RECURRING DUE BANNER — conditional]
[MONTH SUMMARY CARD]
[BUDGET HEALTH]
[KEY INSIGHT]
[RECENT TRANSACTIONS]
[GOALS PREVIEW]
[FAB]
```
 
---
 
## Layout — Desktop
Two-column grid below the header.
 
```
[HEADER]
[RECURRING DUE BANNER — conditional, full width]
Left column (60%):               Right column (40%):
  [MONTH SUMMARY CARD]             [BUDGET HEALTH]
  [RECENT TRANSACTIONS]            [KEY INSIGHT]
                                   [GOALS PREVIEW]
[FAB]
```
 
---
 
## Sections
 
### HEADER
- Left: "Good morning/afternoon/evening, [first name]" — time-aware greeting.
- Right: Current month + year (e.g. "July 2026"). Tappable → opens month picker to navigate to past months (read-only historical view).
- No search bar here. Search lives in /transactions.
### RECURRING DUE BANNER
- Condition: one or more `recurring_templates` where `next_date <= today AND is_active = true`.
- Appearance: amber-bordered banner at top of content area.
- Content: "[N] recurring transaction(s) due. Review now →"
- Tapping navigates to `/recurring`.
- Dismissible per session (stored in Zustand, not database). Reappears next visit if still unconfirmed.
- Hidden when no items due.
### MONTH SUMMARY CARD
- Three numbers in a row:
  - **Income** (green): sum of all income transactions in selected month
  - **Expenses** (red/amber): sum of all expense transactions in selected month
  - **Balance** (green if positive, red if negative): income minus expenses
- Below the three numbers: a thin horizontal bar showing expense as % of income. Full bar = spending equals income. Over-full (negative balance) = red overflow indicator.
- Loading state: three skeleton number blocks.
- Empty state (no transactions): all three show ₦0.00 with no error — it's a valid state for a new user.
### BUDGET HEALTH
- Section heading: "Budgets" with a "View all →" link to /budgets.
- Shows up to 4 budget cards in a 2-column grid (mobile) / vertical list (desktop column).
- Priority order: budgets closest to or over limit shown first.
- Each mini card:
  - Category name + icon
  - Progress bar (green/amber/red)
  - "₦X,XXX / ₦X,XXX" spent vs limit
- "View all →" if more than 4 budgets exist.
- Empty state: "No budgets set. [Add a budget]" — link to /budgets.
- Loading state: 4 skeleton cards.
### KEY INSIGHT
- One sentence. Calculated from current month data.
- Priority logic (show the first that applies):
  1. If any budget is exceeded: "Your [Category] spending is ₦X,XXX over budget this month."
  2. If any budget is at 75%+: "You've used [X]% of your [Category] budget with [N] days left."
  3. If balance is negative: "You've spent ₦X,XXX more than you've earned this month."
  4. If all budgets are under 50%: "You're on track this month. [Top category] is your biggest expense."
  5. If no budgets set: "Set a budget to start tracking your spending limits."
- No insight if fewer than 3 transactions exist — section hidden.
- This is a single, non-interactive text block. No chart. No link. Just the most important thing the user should know right now.
### RECENT TRANSACTIONS
- Section heading: "Recent" with "View all →" link to /transactions.
- Last 8 transactions, sorted by transaction_date desc, then created_at desc.
- Each row:
  - Left: category icon (colored circle) + category name
  - Center: description (truncated to 1 line if long)
  - Right: amount with type indicator (+ green for income, - red for expense)
  - Below left: date formatted as "Today", "Yesterday", or "Mon 30 Jun"
- Tapping a row navigates to edit sheet for that transaction.
- Loading state: 8 skeleton rows.
- Empty state: "No transactions yet. Tap + to add your first." — arrow pointing toward FAB position.
### GOALS PREVIEW
- Section heading: "Goals" with "View all →" link to /goals.
- Shows up to 3 active goals as horizontal scrollable cards (mobile) / vertical stack (desktop).
- Each card:
  - Goal title
  - Progress ring (mini, 48px) showing % complete
  - "₦current / ₦target"
  - Days remaining if target_date set
- Empty state: "No savings goals. [Create one]" — link to /goals.
- Loading state: 3 skeleton cards.
### FAB
- Fixed position, bottom-right.
- Above bottom nav on mobile (bottom: 80px, right: 16px).
- "+" icon. Opens Quick Add sheet (APP_FLOW FLOW 1).
- Always visible on this page.
---
 
## States
 
| Section | Loading | Empty | Error |
|---|---|---|---|
| Month Summary | 3 skeleton blocks | ₦0.00 across all three | "Could not load summary. Retry." |
| Budget Health | 4 skeleton cards | Prompt to add budget | "Could not load budgets. Retry." |
| Key Insight | Hidden | Hidden | Hidden (fail silently) |
| Recent Transactions | 8 skeleton rows | Prompt with FAB arrow | "Could not load transactions. Retry." |
| Goals Preview | 3 skeleton cards | Prompt to create goal | "Could not load goals. Retry." |
 
---
 
## Behavior Notes
- Dashboard data is fetched per-section, not as one monolithic request. Sections load and display independently — a slow goals query does not block the transaction list.
- Month picker on header changes the data context for Month Summary, Budget Health, and Key Insight. Recent Transactions always shows latest regardless of month selection.
- All monetary values formatted via `formatNGN()`. Never raw numbers.
---
 
---
 
# PAGE 5 — Transactions
**Route:** `/transactions`
**Type:** Protected
**App Flow Ref:** FLOW 2
 
---
 
## Purpose
Complete record of every transaction. Fully filterable and searchable. The place you go when you need to find, review, or edit a specific transaction.
 
---
 
## Layout — Mobile
```
[PAGE HEADER]
[FILTER BAR — sticky]
[TRANSACTION LIST — infinite scroll]
[FAB]
```
 
---
 
## Layout — Desktop
```
[PAGE HEADER]
[FILTER BAR — sticky]
[TRANSACTION LIST]
[FAB]
```
 
Desktop: list rows are wider with more visible columns (payment method visible without tap).
 
---
 
## Sections
 
### PAGE HEADER
- Title: "Transactions"
- Right: total count of currently filtered results (e.g. "143 transactions")
### FILTER BAR
- Sticky below header. Does not scroll away.
- Horizontally scrollable on mobile if all filters don't fit.
- Filters:
  1. **Date range** — default: current month. Options: This Month, Last Month, Last 3 Months, This Year, Custom range (date picker).
  2. **Type** — segmented toggle: All / Income / Expense.
  3. **Category** — multi-select dropdown. Shows category name + icon. "All categories" default.
  4. **Payment Method** — dropdown: All, Cash, Card, Transfer, POS, Other.
  5. **Search** — text input. Matches against `description` field. Debounced 300ms.
- Active filters highlighted (amber pill or indicator).
- "Clear all" button appears when any non-default filter is active.
- Filter state persists in Zustand for the session. Navigating away and back restores last filter state.
### TRANSACTION LIST
- Sorted by `transaction_date desc`, then `created_at desc` within a day.
- Grouped by date: date label row ("Today", "Yesterday", "Monday 30 Jun") above each day's transactions.
- Infinite scroll: loads 20 rows at a time. Smooth — no pagination buttons.
- Each transaction row:
  - **Left:** category icon (colored circle, 36px) + category name (bold) + description below (muted, truncated)
  - **Right:** amount (bold, green for income / red for expense) + payment method badge below
  - **Far left:** thin colored bar indicating type (green = income, red/amber = expense)
  - **Date:** shown in the day group header, not repeated per row
- Tapping a row → opens edit bottom sheet (same structure as Quick Add, pre-filled). Does not navigate away from the list.
- **Mobile swipe:** swipe left on a row reveals a red "Delete" action. Tap delete → confirmation dialog → optimistic removal with 5-second undo toast.
- **Desktop:** hover reveals three-dot menu (right side) with Edit and Delete options.
- Loading state: 8 skeleton rows on initial load. Spinner at bottom of list when loading next page.
- Empty state (no transactions at all): "No transactions yet. Tap + to log your first expense."
- Empty state (filters active, no results): "No transactions match your filters." + "Clear filters" button.
- End of list: "All [N] transactions loaded." — no more load triggers.
### FAB
- Same as dashboard. Always visible.
---
 
## Behavior Notes
- Edit sheet is a bottom sheet overlay, not a navigation. URL does not change when edit sheet opens (modal behavior, not a page).
- `/transactions/[id]` route exists for direct deep-linking to a specific transaction (e.g. from an external link or future notification). It renders the edit sheet on top of the transaction list.
- Deleting a transaction does not navigate away. The row disappears from the list (optimistic), undo toast appears.
- Filter query params are not reflected in the URL in v1. Session state only.
---
 
---
 
# PAGE 6 — Transaction Edit (Sheet)
**Route:** `/transactions/[id]`
**Type:** Protected
**App Flow Ref:** FLOW 2
 
---
 
## Purpose
Edit or delete a single transaction. Reuses the Quick Add form layout. Accessed via tap on a transaction row (sheet) or direct URL (full page).
 
---
 
## Layout
When accessed via tap from list: bottom sheet overlay (same as Quick Add).
When accessed via direct URL `/transactions/[id]`: renders as a centered form card on desktop, full-page form on mobile.
 
---
 
## Sections
Identical to Quick Add sheet with these differences:
- All fields pre-filled with existing transaction data.
- "Save Changes" button instead of "Save".
- "Delete Transaction" destructive button at bottom (red, separated from Save by spacer).
- No draft persistence — editing an existing transaction does not use the draft system.
### DELETE FLOW
- Tap "Delete Transaction"
- Confirmation dialog: "Delete this ₦X,XXX [Category] transaction? This cannot be undone."
- Confirm → optimistic removal → close sheet → undo toast for 5 seconds.
- Cancel → dialog closes, transaction unchanged.
---
 
---
 
# PAGE 7 — Budgets
**Route:** `/budgets`
**Type:** Protected
**App Flow Ref:** FLOW 3
 
---
 
## Purpose
Set and monitor monthly spending limits by category. The page that tells you if your plan is surviving contact with reality.
 
---
 
## Layout — Mobile
```
[PAGE HEADER + MONTH SELECTOR]
[BUDGET SUMMARY BAR]
[BUDGET CARD LIST]
[ADD BUDGET BUTTON]
[FAB]
```
 
---
 
## Layout — Desktop
```
[PAGE HEADER + MONTH SELECTOR]
[BUDGET SUMMARY BAR]
[BUDGET CARD GRID — 2 columns]
[ADD BUDGET BUTTON]
[FAB]
```
 
---
 
## Sections
 
### PAGE HEADER + MONTH SELECTOR
- Title: "Budgets"
- Month selector: left/right arrow to navigate months. Current month highlighted. Future months disabled (can't set a budget for a month you haven't reached — v1 restriction. Budgets are set for the current month when you're in it).
- Past months: read-only. Cards show historical data but edit/add buttons hidden.
### BUDGET SUMMARY BAR
- One row, three numbers:
  - Total budgeted this month
  - Total spent this month (across all budgeted categories)
  - Remaining
- Color logic: remaining green if > 25% left, amber if ≤ 25%, red if negative.
- Loading state: skeleton bar.
### BUDGET CARD LIST
- One card per active budget for the selected month.
- Sort order: most overspent first, then by % used descending.
- Each card:
  - Top row: category icon + name (left), budget amount (right, muted)
  - Progress bar: full width, color-coded (green/amber/red per TRD §6.2 thresholds)
  - Below bar: "₦X,XXX spent of ₦X,XXX" (left) + "₦X,XXX remaining" or "₦X,XXX over" (right, red if over)
  - Tapping card (current month only) → opens edit sheet
- Loading state: 4 skeleton cards.
- Empty state (current month, no budgets): "No budgets set for [Month]. Add your first budget below."
- Empty state (past month, no budgets): "No budgets were set for [Month]."
### ADD BUDGET BUTTON
- Visible only for current month.
- Full-width secondary button: "+ Add Budget"
- Opens bottom sheet:
  - Category selector (dropdown, only shows expense categories not already budgeted this month)
  - Amount input (₦, numeric)
  - "Save" button
- If all expense categories already have budgets: button is hidden, message shown: "All categories have budgets this month."
### EDIT BUDGET SHEET
- Same as add sheet but pre-filled.
- "Update" button.
- "Delete Budget" destructive option.
- Deleting a budget does not delete transactions — it only removes the limit.
---
 
## Behavior Notes
- Budget vs actual is computed at query time via a Supabase query that sums transactions by category for the selected month. Not stored.
- Realtime: if user adds a transaction while on the Budgets page (via FAB), the affected budget card updates automatically via TanStack Query invalidation.
- Past month data is fetched fresh — no caching assumptions on historical budgets.
---
 
---
 
# PAGE 8 — Savings Goals
**Route:** `/goals`
**Type:** Protected
**App Flow Ref:** FLOW 4
 
---
 
## Purpose
Visual tracking of named financial targets. Motivation through visible progress. The page that reminds you why you're controlling your spending.
 
---
 
## Layout — Mobile
```
[PAGE HEADER]
[ACTIVE GOALS — card grid]
[COMPLETED GOALS — collapsed section]
[ADD GOAL BUTTON]
[FAB]
```
 
---
 
## Layout — Desktop
```
[PAGE HEADER]
[ACTIVE GOALS — 2-column card grid]
[COMPLETED GOALS — 2-column grid, collapsed by default]
[ADD GOAL BUTTON]
[FAB]
```
 
---
 
## Sections
 
### PAGE HEADER
- Title: "Goals"
- Subtitle: "₦X,XXX saved across [N] active goals" — aggregate summary. Hidden if no active goals.
### ACTIVE GOALS
- Grid of goal cards. 1-column mobile, 2-column desktop.
- Each card:
  - Goal title (bold)
  - Progress ring (80px, centered): % complete, number inside ring
  - "₦current / ₦target" below ring
  - Target date (if set): "Target: 30 Sep 2026" or "X days left" if within 30 days (amber) / 7 days (red)
  - Thin progress bar at card bottom (same % as ring, alternative visual for accessibility)
- Tapping card navigates to `/goals/[id]`
- Loading state: 3 skeleton cards.
- Empty state: "No active goals. Create your first one." + "Create Goal" button.
### COMPLETED GOALS
- Collapsed section: "Completed ([N])" with expand chevron.
- Same card format but desaturated/dimmed.
- Completed = `current_amount >= target_amount` OR manually marked complete.
- Empty: section heading hidden entirely.
### ADD GOAL BUTTON
- Full-width secondary button: "+ New Goal"
- Opens bottom sheet:
  - Title (text, required)
  - Target amount (₦, required)
  - Target date (date picker, optional)
  - Description (textarea, optional)
  - "Create Goal" button
---
 
---
 
# PAGE 9 — Goal Detail
**Route:** `/goals/[id]`
**Type:** Protected
**App Flow Ref:** FLOW 4
 
---
 
## Purpose
Full detail view for a single goal. Log contributions, see history, understand progress.
 
---
 
## Layout — Mobile
```
[BACK NAVIGATION]
[GOAL HEADER]
[LARGE PROGRESS RING]
[STATS ROW]
[LOG CONTRIBUTION BUTTON]
[CONTRIBUTION HISTORY]
[GOAL ACTIONS]
```
 
---
 
## Sections
 
### BACK NAVIGATION
- "← Goals" back link. Returns to /goals.
### GOAL HEADER
- Goal title (large, bold)
- Description (if set, muted text below title)
### LARGE PROGRESS RING
- 160px ring, centered.
- Percentage inside.
- Color: green under 100%, gold/amber at 100%+ (complete).
### STATS ROW
- Three stats in a row:
  - Saved: ₦current_amount
  - Target: ₦target_amount
  - Remaining: ₦(target - current), shown as "0" if complete
### LOG CONTRIBUTION BUTTON
- Primary button: "+ Log Contribution"
- Visible only if goal is active (not completed/archived).
- Opens bottom sheet:
  - Amount (₦, required)
  - Date (default today)
  - Note (optional, single line)
  - "Save Contribution" button
- On save: `current_amount` updated, ring animates to new %, contribution appears in history.
### CONTRIBUTION HISTORY
- Section heading: "Contributions"
- List of past contributions, newest first.
- Each row: date (left) + note if present (center, muted) + amount (right, green).
- If no contributions yet: "No contributions logged yet."
- Contributions are not currently stored as a separate table in v1 — `current_amount` is a running total. Therefore this history list is not available in v1. Section shows only: "₦X,XXX contributed total."
  - **Post-v1:** Add a `goal_contributions` table to enable full history. Document in NOTES.md when implementing.
### GOAL ACTIONS
- Separated from main content by a divider.
- "Mark as Complete" button — appears when `current_amount >= target_amount`. Sets goal to complete state.
- "Archive Goal" — moves to completed section on /goals. Confirmation required.
- "Delete Goal" — destructive, confirmation required. Does not affect any transactions.
---
 
---
 
# PAGE 10 — Analytics
**Route:** `/analytics`
**Type:** Protected
**App Flow Ref:** FLOW 5
 
---
 
## Purpose
Turn transaction history into insight. Show where money actually goes, how this month compares to last, and which categories are leaking money consistently.
 
---
 
## Layout — Mobile
Single column, scrollable sections.
 
```
[PAGE HEADER + MONTH SELECTOR]
[SPENDING BY CATEGORY]
[INCOME VS EXPENSES]
[MONTH-OVER-MONTH]
[TOP SPENDING CATEGORIES]
[MONEY LEAKS]
[DAILY TREND]
```
 
---
 
## Layout — Desktop
Two-column where charts benefit from wider rendering. Single column for text-heavy sections.
 
---
 
## Sections
 
### PAGE HEADER + MONTH SELECTOR
- Title: "Analytics"
- Same month selector as Budgets page. Default: current month.
### SPENDING BY CATEGORY
- Heading: "Where your money went"
- Horizontal bar chart: each expense category as a bar, sorted by amount desc.
- Below chart: breakdown table — category name, amount, % of total expenses.
- Loading: skeleton bars.
- Empty: "No expense transactions for [Month]."
### INCOME VS EXPENSES
- Heading: "Income vs Expenses"
- Two large numbers side by side: Total Income (green) / Total Expenses (red).
- Net balance below: positive green, negative red.
- Simple grouped bar if showing multiple months (stretch — single month default is just the two numbers).
### MONTH-OVER-MONTH COMPARISON
- Heading: "vs Last Month"
- Side-by-side: current month total expenses vs previous month total expenses.
- Delta: "₦X,XXX more/less than last month" with direction arrow.
- Per-category: table showing this month vs last month per category, with +/- delta column.
- Empty if less than 2 months of data: section hidden.
### TOP SPENDING CATEGORIES
- Heading: "Top 5 this month"
- Ranked list: rank number, category icon + name, amount, % of total.
- No chart needed — the list is cleaner.
### MONEY LEAKS
- Heading: "Money Leaks"
- Definition: an expense category that has exceeded its budget in 2 or more of the last 3 months.
- Each leak shows: category name, average overspend per month, "Over budget for [N] months in a row."
- Empty (no leaks): "No consistent overspending detected." — this is a good message, show it with a green indicator.
- Empty (no budgets set): section hidden — can't detect leaks without budgets.
### DAILY TREND
- Heading: "Daily spending — [Month]"
- Line chart: X axis = days of month, Y axis = total spent that day.
- Shows spending rhythm — helps identify weekend spikes, end-of-month crunch, etc.
- Empty (no transactions): section hidden.
---
 
## States
- All sections load independently.
- Insufficient data threshold: if fewer than 5 transactions in selected month, show a single banner: "Add more transactions to unlock full insights." — individual sections still render with whatever data exists.
- Each chart has its own loading skeleton matching the chart's approximate shape.
---
 
---
 
# PAGE 11 — Recurring Transactions
**Route:** `/recurring`
**Type:** Protected
**App Flow Ref:** FLOW 6
 
---
 
## Purpose
Manage predictable, repeating transactions. The place where you tell the app about your salary, your data bundle, your transport allowance — so it can remind you to log them.
 
---
 
## Layout — Mobile
```
[PAGE HEADER]
[DUE NOW — conditional section]
[ALL TEMPLATES LIST]
[ADD TEMPLATE BUTTON]
[FAB]
```
 
---
 
## Sections
 
### PAGE HEADER
- Title: "Recurring"
- Subtitle: count of active templates ("5 active templates")
### DUE NOW
- Condition: one or more active templates with `next_date <= today`.
- Heading: "Due Now" with amber indicator dot.
- List of due templates only.
- Each row: description + category (left), amount (right), "Due today" or "X days overdue" label (amber/red).
- Two actions per row:
  - **"Confirm"** (primary) → creates transaction → advances next_date → removes from due list
  - **"Skip"** (ghost) → advances next_date without creating transaction → removes from due list
- If none due: section hidden entirely.
### ALL TEMPLATES LIST
- Heading: "All Templates"
- Lists all active recurring templates. Due items are not duplicated here.
- Each row:
  - Left: category icon + description
  - Right: amount + frequency label ("Monthly", "Weekly", etc.)
  - Below: "Next due: [date]"
- Tapping row → edit sheet (same as add, pre-filled).
- Toggle switch on each row: active/inactive.
- Loading: skeleton rows.
- Empty (no templates at all): "No recurring templates. Add one to get started."
- Inactive templates shown below active ones, dimmed.
### ADD TEMPLATE BUTTON
- "+ New Recurring" — opens bottom sheet:
  - Description (text, required)
  - Category (selector, required)
  - Type (Income / Expense toggle)
  - Amount (₦, required)
  - Frequency (Daily / Weekly / Monthly / Yearly — segmented selector)
  - First occurrence / next date (date picker, required)
  - "Create" button
---
 
---
 
# PAGE 12 — Settings
**Route:** `/settings`
**Type:** Protected
**App Flow Ref:** §2.3, FLOW 7
 
---
 
## Purpose
User preferences and account management. Minimal. Does not need to be impressive — it needs to work.
 
---
 
## Layout — Mobile
```
[PAGE HEADER]
[PROFILE SECTION]
[PREFERENCES SECTION]
[CURRENCY WIDGET]
[DANGER ZONE]
```
 
---
 
## Sections
 
### PAGE HEADER
- Title: "Settings"
### PROFILE SECTION
- Heading: "Profile"
- Avatar (from Clerk, not editable here)
- Full name (from Clerk, display only)
- Email (from Clerk, display only)
- "Edit profile →" external link that opens Clerk's hosted account management UI in a new tab. Do not build a custom profile editor.
### PREFERENCES SECTION
- Heading: "Preferences"
- Default Payment Method: dropdown (Cash / Card / Transfer / POS / Other). Selected value pre-fills the Quick Add form.
- Stored in `profiles` table or localStorage — TBD during implementation. Document choice in NOTES.md.
- More preferences added here as discovered during real usage (per PHASES.md §Phase 5).
### CURRENCY WIDGET
- Heading: "Currency Reference"
- Subheading: "Not tied to your transactions. For reference only."
- Input: ₦ amount (numeric)
- Output: equivalent in USD, GBP, EUR — displayed as three rows below input.
- Rate source note: "Rates from exchangerate-api.com. Last updated [timestamp]."
- Error state: "Rates unavailable. Check your connection." Rest of settings page unaffected.
**Implementation — read this before building:**
- The widget never calls ExchangeRate API directly. No API key or external URL is ever sent to the client.
- On page load, the widget calls the internal route handler: `GET /api/rates`.
- Route handler lives at `app/api/rates/route.ts`. It reads `process.env.CURRENCY_API_KEY` and `process.env.CURRENCY_API_BASE_URL` server-side, calls `{CURRENCY_API_BASE_URL}/{CURRENCY_API_KEY}/latest/NGN`, and returns only `{ USD: number, GBP: number, EUR: number, lastUpdated: string }`.
- Client receives the three rates and the timestamp. Nothing else from the ExchangeRate response is forwarded.
- Rates are cached in component state for the session. The route is not called again unless the page is reloaded.
- Conversion is calculated client-side: `userInput * rate`. No additional API calls per keystroke.
- If `/api/rates` returns an error or times out: widget shows error state. No retry loop. User reloads if needed.
- `CURRENCY_API_KEY` and `CURRENCY_API_BASE_URL` have no `NEXT_PUBLIC_` prefix. They are server-only. See TRD.md §4.4.
### DANGER ZONE
- Heading: "Account"
- "Sign out" button — full width, secondary styling.
- On tap: Clerk signs out, redirect to `/`.
- No account deletion in v1. No data export from settings in v1 (export is Phase 4).
---
 
---
 
# PAGE 13 — Category Management
**Route:** `/settings/categories`
**Type:** Protected
**App Flow Ref:** §8
 
---
 
## Purpose
Manage the categories used to classify transactions. Add new ones, rename existing ones, archive ones no longer needed.
 
---
 
## Layout — Mobile
```
[PAGE HEADER + BACK]
[EXPENSE CATEGORIES]
[INCOME CATEGORIES]
[ADD CATEGORY BUTTON]
```
 
---
 
## Sections
 
### PAGE HEADER + BACK
- "← Settings" back link.
- Title: "Categories"
### EXPENSE CATEGORIES
- Heading: "Expenses"
- List of all active expense categories.
- Each row:
  - Colored icon circle (category color) + category name
  - "Default" badge if `is_default = true`
  - Right: pencil icon (edit) + archive icon (archive, disabled for default categories)
- Tap pencil → inline edit or bottom sheet with name and color picker.
- Archive confirmation: "Archive [Category]? Existing transactions keep this category. You won't see it in new transaction forms."
### INCOME CATEGORIES
- Heading: "Income"
- Same format as expense list.
### ARCHIVED CATEGORIES
- Collapsed section: "Archived ([N])"
- Each row has "Restore" action.
- Empty: section hidden.
### ADD CATEGORY BUTTON
- "+ New Category"
- Bottom sheet:
  - Name (text)
  - Type: Income / Expense (toggle)
  - Color (color picker — limited palette of 12 colors from UI/UX_BRIEF.md)
  - Icon (optional — icon picker, small predefined set)
  - "Create" button
- Validation: name required, cannot match an existing active category name for the same type.
---
 
## Behavior Notes
- Categories with linked transactions cannot be deleted — only archived. The archive action is available on all categories including defaults.
- Default categories (`is_default = true`) cannot be archived from this UI in v1. They can only be renamed. This prevents a new user from accidentally nuking their entire category set.
- Renaming a category renames it everywhere — all existing transactions reflect the new name immediately since they store `category_id`, not the name string.
---
 
---
 
## Global Component Inventory
 
The following components appear across multiple pages and must be built once and reused:
 
| Component | Used On |
|---|---|
| Quick Add Sheet | Dashboard, Transactions, Budgets, Goals, Analytics, Recurring (via FAB) |
| Theme Toggle | Every page — public and protected, mobile and desktop |
| FAB | All protected pages except Settings |
| Bottom Navigation | All protected pages (mobile) |
| Sidebar | All protected pages (desktop) |
| Month Selector | Dashboard, Budgets, Analytics |
| Skeleton Loader | All data-dependent sections |
| Toast Notifications | All mutation feedback |
| Confirmation Dialog | Delete transaction, delete budget, archive category, delete goal |
| Category Selector | Quick Add, Add Budget, Add Recurring |
| Budget Progress Card | Dashboard, Budgets |
 
---
 
*This document defines every page. If a screen exists in the app but not in this document, it should not have been built. If a screen is missing from this document, add the spec before building it.*

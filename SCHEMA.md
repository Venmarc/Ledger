# SCHEMA.md — Database Schema
**Project:** Ledger
**Last Updated:** 05/07/2026
**Status:** Pre-build. Docs phase.
 
**References:** PRD.md · TRD.md · PHASES.md · NOTES.md
 
---
 
## Critical Rules Before Reading
 
- All `user_id` columns are type **`text`**. Not `uuid`. Clerk user IDs are prefixed strings. Storing as `uuid` breaks everything silently.
- RLS on every table uses `auth.jwt() ->> 'sub'`. Not `auth.uid()`. See TRD.md §2.3.
- All monetary columns are `numeric(15,2)`. No `float`. No `integer`.
- The app is NGN-only. No currency conversion columns. No `exchange_rates` table.
- Timestamps stored in UTC. Display layer handles `Africa/Lagos` conversion.
---
 
## Tables
 
### `profiles`
Synced from Clerk on first sign-in. One row per user.
 
```sql
create table public.profiles (
  id            text primary key,              -- Clerk user ID (e.g. user_2abc...)
  full_name     text,
  avatar_url    text,
  base_currency text not null default 'NGN',
  timezone      text not null default 'Africa/Lagos',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```
 
**Notes:**
- `id` is the Clerk user ID stored directly as text. No separate `clerk_id` column needed — the Clerk ID is the primary key.
- No `auth.users` foreign key reference. Clerk owns auth. Supabase owns data.
- Upserted (not inserted) on every sign-in to keep `full_name` and `avatar_url` fresh.
---
 
### `categories`
User-owned. Seeded with Nigerian defaults on account creation.
 
```sql
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references public.profiles(id) on delete cascade,
  name        text not null,
  type        text not null check (type in ('income', 'expense')),
  color       text not null default '#3b82f6',
  icon        text,
  is_default  boolean not null default false,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now()
);
```
 
**Default seed (applied per user on account creation):**
 
| Name | Type |
|---|---|
| Transport | expense |
| Feeding | expense |
| Rent | expense |
| Airtime / Data | expense |
| NEPA / Electricity | expense |
| College / School | expense |
| Groceries | expense |
| Household | expense |
| Health | expense |
| Misc | expense |
| Salary | income |
| Freelance | income |
| Gift | income |
 
**Notes:**
- `is_archived` replaces hard delete. Archived categories are hidden from the UI but retained for historical transaction accuracy.
- `is_default` marks the seeded categories. Users can rename but not delete defaults (archive only).
---
 
### `transactions`
Core of the app. Every money movement lives here.
 
```sql
create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null references public.profiles(id) on delete cascade,
  category_id      uuid not null references public.categories(id) on delete restrict,
  amount           numeric(15,2) not null check (amount > 0),
  type             text not null check (type in ('income', 'expense')),
  transaction_date date not null,
  description      text,
  notes            text,
  payment_method   text check (payment_method in ('Cash', 'Card', 'Transfer', 'POS', 'Other')),
  tags             text[],
  recurring_id     uuid references public.recurring_templates(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
```
 
**Notes:**
- `amount` is always positive. `type` determines if it's income or expense. Never store negative amounts.
- `transaction_date` is a `date` (no time). Time of logging is `created_at`. This matters for budget period calculations.
- `recurring_id` links a transaction to the template that generated it. Nullable — most transactions are one-off.
- `category_id` uses `on delete restrict` — you cannot delete a category that has transactions. Archive it instead.
- No `currency` column. NGN only. This is intentional and documented in PRD.md §5.
---
 
### `budgets`
Monthly spending limits per category.
 
```sql
create table public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  period      text not null check (period in ('monthly')),
  month       date not null,             -- first day of the month, e.g. 2026-07-01
  amount      numeric(15,2) not null check (amount > 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, category_id, month)
);
```
 
**Notes:**
- `period` is locked to `monthly` in v1. Weekly and yearly are not supported. The constraint documents this.
- `month` stores the first day of the month. Use `date_trunc('month', now())` when querying current budgets.
- `unique (user_id, category_id, month)` prevents duplicate budgets for the same category and month.
- No rollover. When a month ends, the budget for that month is historical. The next month needs its own budget set.
- Budget vs actual is computed at query time — not stored. Avoids stale data.
---
 
### `savings_goals`
Named targets with manual contribution tracking.
 
```sql
create table public.savings_goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null references public.profiles(id) on delete cascade,
  title          text not null,
  description    text,
  target_amount  numeric(15,2) not null check (target_amount > 0),
  current_amount numeric(15,2) not null default 0 check (current_amount >= 0),
  target_date    date,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
```
 
**Notes:**
- `current_amount` is manually updated when the user logs a contribution. Not auto-calculated from transactions.
- `target_date` is optional. Goals without a deadline are valid.
- Completed goals (`current_amount >= target_amount`) are not auto-archived — user closes them manually.
---
 
### `recurring_templates`
Blueprints for transactions that repeat on a schedule.
 
```sql
create table public.recurring_templates (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  amount      numeric(15,2) not null check (amount > 0),
  type        text not null check (type in ('income', 'expense')),
  description text,
  frequency   text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_date   date not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
```
 
**Notes:**
- `next_date` is updated after the user confirms a suggested transaction. System does not auto-advance it.
- The app surfaces a notification/prompt when `next_date <= today`. User confirms or skips. See PRD.md §4.7.
- Confirmed templates create a real row in `transactions` with `recurring_id` set to this template's `id`.
- Skipping increments `next_date` without creating a transaction.
---
 
## Indexes
 
```sql
-- Transaction queries (dashboard, list, analytics) always filter by user + date
create index idx_transactions_user_date
  on transactions(user_id, transaction_date desc);
 
-- Category breakdown queries
create index idx_transactions_user_category
  on transactions(user_id, category_id);
 
-- Budget lookups by month
create index idx_budgets_user_month
  on budgets(user_id, month desc);
 
-- Recurring templates due check
create index idx_recurring_user_next
  on recurring_templates(user_id, next_date)
  where is_active = true;
```
 
---
 
## Row Level Security
 
Enable RLS on all tables, then apply the following policy pattern.
Replace `transactions` with each table name.
 
```sql
-- Enable RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.recurring_templates enable row level security;
 
-- Policy pattern (repeat for each table)
create policy "Users access own data"
  on public.transactions
  for all
  using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);
```
 
**For `profiles`:** the `id` column is the Clerk user ID, so the policy compares against `id` not `user_id`:
```sql
create policy "Users access own profile"
  on public.profiles
  for all
  using ((auth.jwt() ->> 'sub') = id)
  with check ((auth.jwt() ->> 'sub') = id);
```
 
---
 
## Triggers
 
Auto-update `updated_at` on every table that has it:
 
```sql
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
 
-- Apply to each relevant table
create trigger set_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();
 
-- Repeat for: profiles, budgets, savings_goals
```
 
---
 
## What Is NOT in This Schema
 
| Omitted | Reason |
|---|---|
| `exchange_rates` table | App is NGN-only. Currency widget is UI-only. |
| `amount_base` column | No conversion needed. All amounts are ₦. |
| `currency` column on transactions | Same reason. |
| Rollover columns on budgets | No rollover in v1. |
| `transaction_links` table | Goal contributions are manual. No linking needed in v1. |
| Any `float` or `double precision` money column | Floating point on financial data is a bug, not a feature. |
 
---
 
*Schema changes require a corresponding migration file. Never alter production columns directly. Document breaking changes in NOTES.md with a timestamp.*

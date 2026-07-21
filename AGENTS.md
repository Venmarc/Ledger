<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENT_CONTEXT.md

**Project:** Ledger
**Document Type:** Agent Orientation, Non-Negotiable Rules & Decision Registry
**Last Updated:** July 16, 2026
**References:** PRD.md · TRD.md · SCHEMA.md · PHASES.md · APP_FLOW.md · PAGE_SPECS.md · UIUX_BRIEF.md · DESIGN.md · NOTES.md

---

# 🛑 STOP. READ THIS ENTIRE FILE BEFORE WRITING A SINGLE LINE OF CODE.

You are about to work on **Ledger**. You are prone to:

- Drifting from the active phase into future features.
- Using hardcoded hex where design tokens exist.
- Breaking mobile-first layouts or WCAG contrast in light mode.
- Re-litigating decisions already documented here or in TRD.md.

**None of that happens here.**

---

## 0. What Ledger Is (And Is Not)

**IS:**

- A personal expense + budget tracker for Nigerian realities (NGN-only, inflation-aware routines).
- A portfolio showcase with fintech-grade precision — tabular nums, restrained palette, fast logging UX.

**IS NOT:**

- Multi-currency SaaS, bank sync, investments, or shared family accounts in v1.
- Beige SaaS templates, rainbow grids, or over-rounded "cream puff" UI.

**The single goal:** Ship a lightweight tracker Victor actually uses daily — fast expense logging, clear money-leak visibility, budget discipline.

If your changes move away from that goal → stop, flag it, and wait.

---

## 1. Non-Negotiable Rules (Violations = Task Failed)

### 1.1 Visual & Theming

- **Dark + light themes.** Theme provider wraps the app; `data-theme` on `<html>`. Persist choice in `localStorage` under `ledger-theme`. Default dark on first visit.
- **Use CSS custom properties** from `globals.css` / UIUX_BRIEF — never hardcoded hex in components.
- **Tabular figures** on all monetary amounts (`tabular-nums` / `font-variant-numeric: tabular-nums`).
- **Orange CTAs** use `text-orange-btn-text` (`#0A0A0A`) — not `text-text-inverse` (fails WCAG on orange in light mode).
- **Light-mode active nav:** `--color-azure` must meet contrast on `bg-azure-muted` (sky-700 `#0369A1`, not default sky-400).

### 1.2 Layout & Responsiveness

- **Mobile-first.** Every shell, card, and control must work at 375px.
- **Desktop sidebar:** full-height, edge-to-edge. Top bar spans content area only. Width via `--sidebar-width` CSS variable (see vault skill: Collapsible Desktop Sidebar).
- **Touch targets ≥ 44px mobile, ≥ 48px where specified** in UIUX_BRIEF.
- **Collapsed sidebar:** icon-only rail with portal tooltips; `aria-label` on every icon link.

### 1.3 Auth & Clerk

- **Dedicated auth pages** at `/sign-in` and `/sign-up` — not Clerk modals on other routes.
- **Auth layout:** render the Clerk card cleanly; keep **"Back to home"** footer below the card, deferred until client mount (fade in with the card).
- **Wrap `getToken({ template: 'supabase' })` in try/catch** — missing JWT template must not crash profile sync.
- **Mobile-only Settings link** inside `<UserButton.MenuItems>` when viewport `< 768px`; never render an empty `MenuItems` container on desktop.
- **No `middleware.ts`.** Use `proxy.ts` only (Next.js 16).

### 1.4 Data & Supabase

- **`user_id` is always `text`.** Never `uuid`. RLS uses `auth.jwt() ->> 'sub'` — never `auth.uid()`.
- **All money columns:** `numeric(15,2)`. No float. No integer kobo storage.
- **NGN-only** at the data layer. No exchange_rates table.
- **Profile sync:** client `<ProfileSync />` in `useEffect` — never `await syncUserProfile()` in a Server Component layout.
- **Optional record lookups:** use `.maybeSingle()` or direct `.upsert()` — not `.single()` on existence checks.
- **Timestamps:** UTC in DB; display in `Africa/Lagos`.

### 1.5 Performance & Tooling

- **`next dev --webpack`** for local dev (Turbopack unstable on Victor's machine).
- **`.superpowers/`** is agent workspace — in `.gitignore`, not part of the app.

### 1.6 Scope

- **Read `PHASES.md` first.** Do not build ahead of the active phase.
- **These docs are origin.** Files under `.superpowers/` or ad-hoc build notes are secondary.
- **Surgical changes only** — do not refactor unrelated files to "clean up."

### 1.8 Session Conduct (standing directives — append-only)

- **Diagnose before fixing.** Confirm root cause on visual/auth bugs before implementing.
- **Do not declare a phase complete until Victor explicitly confirms** — even if every deliverable passes verification.
- **Stop at the phase gate.** When Phase N is closed, do not scope-creep into Phase N+1.
- **Prioritize frontend quality, speed, and security** on foundation work.
- **Read vault anti-patterns first:** `/home/redmane/Documents/SecondBrain/ANTI_PATTERNS.md` (cross-project, short).

---

## 2. Technical Decisions Already Made (Do Not Re-Litigate)

| Decision | Answer |
|---|---|
| Framework | Next.js 16, App Router |
| Language | TypeScript, strict |
| Auth | Clerk + Custom Session Tokens |
| Database | Supabase (Postgres + RLS) |
| Styling | Tailwind CSS + shadcn/ui (Radix / Nova preset) |
| State | Zustand (UI) + TanStack Query (server cache) |
| Local dev | `next dev --webpack` |
| Middleware | `proxy.ts` only — never `middleware.ts` |
| Profile sync | Client `<ProfileSync />`, not blocking server layout |
| Currency | NGN only |
| Sidebar | Collapsible rail + `LayoutShell` + portal tooltips |
| Seed scripts | `NODE_OPTIONS="--experimental-websocket"` on Node 20 |

---

## 3. Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | `next dev --webpack` |
| `npm run build` | Production build |
| `npm run lint` | ESLint (project code — not vault) |

No test framework installed yet.

---

## 4. Required Reading Order (Every Session)

0. `/home/redmane/Documents/SecondBrain/ANTI_PATTERNS.md`
1. `PHASES.md` — active phase and gate conditions
2. `TRD.md` — stack, Clerk+Supabase integration, data rules
3. `SCHEMA.md` — tables, RLS, indexes
4. `DESIGN.md` / `UIUX_BRIEF.md` — tokens, components, contrast
5. `APP_FLOW.md` / `PAGE_SPECS.md` — page you're touching
6. `PRD.md` — product scope and non-goals

---

## 5. Agent Workflow

**Step 1 — Read.** Complete §4. No code until done.

**Step 2 — Plan.** Files to touch, tokens, mobile behavior, accessibility, verification commands.

**Step 3 — Get approval.** Post plan; wait for explicit go-ahead unless Victor said "proceed."

**Step 4 — Implement surgically.**

**Step 5 — Verify.**

- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Renders at 375px without horizontal scroll
- [ ] WCAG AA contrast checked if touching colors in either theme

**Step 6 — Update docs** if decisions changed (PHASES.md, SCHEMA.md, etc.).

---

**State the active phase, present your plan, and wait for approval.**
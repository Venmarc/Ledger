**PROJECT.md**

**Project Name:** Ledger
**Tagline:** Personal finance OS for tracking every Naira, killing bad spending, hitting budgets, and building real financial clarity.

### 1. Vision & Objectives
Build a fast, trustworthy, and insightful expense tracker tailored for Nigerian realities that you will actually use daily for all transactions.

**Primary Goals:**
- Personal: Get full control over Transport, Feeding, College expenses and other spending. Understand your money leaks and build saving discipline.
- Portfolio: Strong fintech-grade project showing complex transactions, budgeting engine, beautiful data visualizations, and production polish.
- Demonstrate: Precise money handling, insightful correlations, fast UX, scalable schema.

**Non-goals (v1):** Bank sync, investments, taxes, multi-currency (Naira primary), shared family accounts, invoicing.

### 2. Target User
- You (Nigerian tech professional/student fighting inflation and daily expenses).
- Similar users who want simplicity + depth without Excel.

### 3. Core Modules

**Transaction Core**
- Extremely fast entry (amount in ₦, date, category, merchant, notes, tags, payment method).
- Income + Expense support.
- CSV import.
- Receipt upload (optional).

**Budgets & Planning**
- Monthly budgets by category/group.
- Rollover options.
- Budget vs Actual with strong visuals.

**Analytics & Insights**
- Spending trends, category breakdowns, heatmaps, top merchants.
- Weekend/weekday patterns, transport vs feeding analysis, etc.
- Savings rate and burn rate.

**Goals & Savings**
- Savings goals (emergency fund, school fees, gadgets, etc.).
- Progress tracking + projections.

**Dashboard**
- Month overview, budget health, recent activity, key insights.

### 4. Critical User Flows
- Log transaction in under 10 seconds.
- Monthly review flow must be excellent.
- Fast category selection with Nigerian common categories.

### 5. Non-Functional Requirements
- All money fields use precise decimal handling.
- Default currency: Nigerian Naira (₦).
- Dark mode default, premium trustworthy fintech aesthetic.
- Mobile-first PWA.
- Excellent performance with years of transaction data.

### 6. Development Phases

See **PHASES.md** for detailed deliverables, timelines, and success criteria per phase.

**High-level:**
- Phase 0: Foundation  
- Phase 1: Core Transactions  
- Phase 2: Budgets + Analytics  
- Phase 3: Goals + Recurring  
- Phase 4: Polish + PWA  
- Phase 5: Real Usage & Refinement

### 7. Design & Feel Guidelines
- Clean, professional, minimal. Green for income, red/amber for spending.
- Fast and motivating — never frustrating.

### 8. Project Documentation Structure
This PROJECT.md is the **single source of truth**. All other documents support it.

- **README.md** — Public portfolio version (features, screenshots, tech stack, demo link).
- **PROJECT.md** (this file) — Vision, scope, modules, phases, success criteria.
- **CONSTITUTION.md** — Non-negotiable rules and quality standards.
- **DECISIONS.md** — All major architectural and tech decisions with rationale.
- **PHASES.md** — for detailed deliverables, timelines, and success criteria per phase.
- **SCHEMA.md** — Complete database schema, types, RLS policies.
- **NOTES.md** — Your personal scratchpad and daily notes.

**Usage Rules:**
- Reference these files in every major planning/implementation step.
- Update PROJECT.md first before changing scope.
- Keep documentation minimal but accurate.

### 9. Success Criteria
- You log every single transaction without friction for 30+ days.
- Senior dev says “this feels like a real product”.
- Impressive demo in under 3 minutes.
- Strong, insightful visualizations.
- Clean, type-safe, well-architected codebase.

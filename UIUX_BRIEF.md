# UI/UX_BRIEF.md — Design System & Interaction Guide
**Project:** Ledger
**Last Updated:** 06/07/2026
**Status:** Pre-build. Docs phase.
 
**References:** PRD.md · TRD.md · APP_FLOW.md · PAGE_SPECS.md · NOTES.md
 
---
 
## 1. Design Philosophy
 
Ledger should feel like a tool built by someone who takes their money seriously. Not a startup toy. Not a colorful budgeting app for people who don't actually track their budget. The aesthetic is dark, precise, and direct — the same way a Bloomberg terminal feels serious without trying to be friendly.
 
**Design references:**
- **CodeRabbit** — dark mode execution. Deep backgrounds, clean typography hierarchy, orange accent used sparingly and with purpose. Not thrown everywhere.
- **Firecrawl** — works in both light and dark. Confident use of orange. Feels technical without feeling cold.
**What this means in practice:**
- Orange is an accent, not a theme color. It highlights actions, not backgrounds.
- Space is generous. Cramped layouts signal rushed thinking.
- Every visual element must earn its place. Decoration that doesn't carry information gets cut.
- The app should feel calm when things are going well, and create clear urgency when they're not.
---
 
## 2. Color System
 
All colors defined as CSS custom properties. No hex codes hardcoded in components. Ever.
 
### 2.1 Base (Dark Mode — Default)
 
```css
--color-bg-base: #0A0A0A;          /* Page background. Near black. */
--color-bg-surface: #141414;       /* Cards, sheets, panels. */
--color-bg-elevated: #1C1C1C;      /* Dropdowns, modals, tooltips. */
--color-bg-subtle: #232323;        /* Hover states on list rows. */
--color-border: #2A2A2A;           /* Dividers, card borders, input borders. */
--color-border-strong: #3A3A3A;    /* Focused input borders (before orange ring). */
```
 
### 2.2 Text
 
```css
--color-text-primary: #F5F5F5;     /* Main body text, numbers. */
--color-text-secondary: #A3A3A3;   /* Labels, muted descriptions, dates. */
--color-text-tertiary: #6B6B6B;    /* Placeholder text, disabled states. */
--color-text-inverse: #0A0A0A;     /* Text on orange/light backgrounds. */
```
 
### 2.3 Primary Accent — Orange
 
Inspired by CodeRabbit and Firecrawl. Used for primary buttons, active states, key highlights.
 
```css
--color-orange: #F97316;           /* Primary orange. Tailwind orange-500. */
--color-orange-hover: #EA6C0A;     /* Hover state — slightly deeper. */
--color-orange-muted: #431407;     /* Subtle orange backgrounds (badges, highlights). */
--color-orange-border: #7C2D12;    /* Orange-tinted borders for callouts. */
```
 
### 2.4 Secondary Accent — Azure
 
Used for active navigation items, healthy budget progress bars, and goal progress rings.
 
```css
--color-azure: #38BDF8;            /* Active nav, healthy progress. Sky-400. */
--color-azure-hover: #0EA5E9;      /* Hover on azure elements. */
--color-azure-muted: #082F49;      /* Subtle azure backgrounds. */
```
 
### 2.5 Semantic Colors
 
These are non-negotiable. Defined in TRD.md §6.2. Applied here with exact values.
 
```css
/* Income / positive / under budget */
--color-green: #22C55E;            /* Green-500 */
--color-green-hover: #16A34A;
--color-green-muted: #052E16;      /* Background for income badges. */
 
/* Warning / approaching budget limit ≥75% */
--color-amber: #F59E0B;            /* Amber-500 */
--color-amber-hover: #D97706;
--color-amber-muted: #1C1002;
 
/* Expense / overspent / danger */
--color-red: #EF4444;              /* Red-500 */
--color-red-hover: #DC2626;
--color-red-muted: #1C0202;
```
 
### 2.6 Focus Ring
 
```css
--color-focus-ring: #F97316;       /* Orange. Primary accent. Not red. */
```
 
Focus rings are orange because orange is the primary accent color. Red = error/danger in this system. A red focus ring on a clean input field looks like a validation failure. It is not a valid design choice here.
 
Applied via:
```css
*:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```
 
### 2.7 Light Mode (Architecture: Phase 0 · Values Refined: Phase 4)
 
The theme-switching mechanism is built and verified in Phase 0 — not deferred. Per NOTES.md and TRD.md §6.1, theme switching must exist at project start or every component built afterward requires retrofitting. Phase 0's gate explicitly tests that toggling `data-theme` changes rendered colors app-wide.
 
What Phase 0 delivers: a fully functional Theme Toggle component (see §6.10), correctly placed per APP_FLOW.md §3.2, with working persistence — using these placeholder light-mode values.
What Phase 4 delivers: replacing the placeholder values above with final, tested light-mode colors. The toggle component itself is not rebuilt.
 
The values below are placeholders for the Phase 0 architecture check — expect them to change in Phase 4.
 
```css
[data-theme="light"] {
  --color-bg-base: #FAFAFA;
  --color-bg-surface: #FFFFFF;
  --color-bg-elevated: #F5F5F5;
  --color-bg-subtle: #EFEFEF;
  --color-border: #E5E5E5;
  --color-border-strong: #D4D4D4;
  --color-text-primary: #0A0A0A;
  --color-text-secondary: #525252;
  --color-text-tertiary: #A3A3A3;
  /* Accent colors remain the same in light mode. */
}
```
 
### 2.8 Neutral / System Accent
 
Used for default category icon backgrounds, neutral badges, and uncolored UI elements. Stone family chosen because warm-toned gray shares the same orange hue family without competing with orange CTAs or clashing with cool-blue azure accents.
 
```css
--color-neutral: #57534E;          /* Stone-600 — warm-toned gray */
--color-neutral-hover: #6B6560;
--color-neutral-muted: #292524;    /* Background for neutral badges/icon circles (dark) */
--color-neutral-border: #44403C;
```
 
In light mode: `--color-neutral-muted` resolves to `#F1EFEC` (pale warm tone for AA contrast on white surface), `--color-neutral-border` resolves to `#D6D3D1`.
 
---
 
## 3. Typography
 
### 3.1 Font Stack
 
```css
--font-display: 'Space Grotesk', system-ui, sans-serif;   /* Headings, page titles, large numbers */
--font-body: 'Inter', system-ui, sans-serif;               /* Body text, labels, form inputs */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;    /* Code only. Not used for amounts. */
```
 
**Why Space Grotesk over Outfit:** Space Grotesk has more character at large sizes, better tabular figure support, and reads as more premium for a finance tool. Outfit is friendly — Ledger is not trying to be friendly.
 
**Why Inter for body:** Best small-size readability of any sans-serif. Excellent number glyph rendering. Industry standard for finance UIs for good reason.
 
**Why no monospace for amounts:** Amounts use Inter with `font-variant-numeric: tabular-nums`. This keeps columns aligned without the visual noise of a monospace font in a UI context.
 
### 3.2 Type Scale
 
```css
--text-xs: 0.75rem;     /* 12px — badges, timestamps, fine print */
--text-sm: 0.875rem;    /* 14px — secondary labels, table data */
--text-base: 1rem;      /* 16px — body text, form inputs */
--text-lg: 1.125rem;    /* 18px — card titles, section subheadings */
--text-xl: 1.25rem;     /* 20px — page subheadings */
--text-2xl: 1.5rem;     /* 24px — page titles, dashboard numbers */
--text-3xl: 1.875rem;   /* 30px — hero numbers, goal target amounts */
--text-4xl: 2.25rem;    /* 36px — landing page headline */
```
 
### 3.3 Font Weight Usage
 
```css
--weight-regular: 400;   /* Body text, descriptions, secondary labels */
--weight-medium: 500;    /* Form labels, nav items, table column headers */
--weight-semibold: 600;  /* Card titles, amounts in transaction rows */
--weight-bold: 700;      /* Page titles, dashboard summary numbers, CTAs */
```
 
### 3.4 Amount Display Rules
 
All monetary amounts follow these rules without exception:
 
- Font: Inter, `font-variant-numeric: tabular-nums`, `font-feature-settings: "tnum"`
- Income: `--color-green`, weight semibold
- Expense: `--color-red`, weight semibold
- Neutral/balance: `--color-text-primary`, weight bold
- Large display amounts (dashboard summary): `--text-3xl`, bold
- Transaction row amounts: `--text-base`, semibold
- Budget remaining: `--text-sm`, medium, color depends on % remaining
---
 
## 4. Spacing & Layout
 
### 4.1 Spacing Scale
 
Base unit: 4px. All spacing is a multiple.
 
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```
 
### 4.2 Layout Containers
 
```css
--container-app: 1100px;     /* Max width for app content areas */
--container-landing: 1100px; /* Max width for landing page */
--container-form: 480px;     /* Max width for centered forms (sign-in, sign-up) */
```
 
### 4.3 Sidebar & Navigation
 
- **Sidebar width (desktop):** 240px, fixed left
- **Content area (desktop):** calc(100% - 240px), right of sidebar
- **Bottom nav height (mobile):** 64px
- **Top header height:** 56px
### 4.4 Border Radius
 
```css
--radius-sm: 6px;     /* Badges, tags, small elements */
--radius-md: 10px;    /* Cards, inputs, buttons */
--radius-lg: 14px;    /* Bottom sheets, modals, larger cards */
--radius-full: 9999px; /* Pills, toggles, avatar circles */
```
 
### 4.5 Touch Targets
 
All interactive elements minimum 44×44px on mobile. Non-negotiable for accessibility and usability.
 
---
 
## 5. Logo Behavior
 
### 5.1 Structure
 
All Ledger logos are stored as SVG with no background fill. The logo container has no border, no outline, no shadow of its own — the glow effect is applied via CSS `filter: drop-shadow()` or `box-shadow` on the container.
 
### 5.2 Glow System
 
The glow matches the project's primary accent: **orange** (`#F97316`).
 
In dark mode (default), the shadow is a light-orange glow. Behavior per theme:
 
| Theme | Shadow character |
|---|---|
| Dark (default) | Light orange glow — `drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))` resting |
| Light | Deeper orange glow — `drop-shadow(0 0 6px rgba(234, 108, 10, 0.5))` resting |
 
The glow is never purely white or purely black. It is always tinted with the accent color, which means it reads as intentional, not as a browser default.
 
### 5.3 Solo Logo — Resting State
 
```css
.logo-solo {
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.35));
  transition: filter 200ms ease, transform 200ms ease;
}
```
 
Subtle. Visible but not demanding attention.
 
### 5.4 Solo Logo — Hover State
 
```css
.logo-solo:hover {
  filter: drop-shadow(0 0 14px rgba(249, 115, 22, 0.6));
  transform: translateY(-2px);
}
```
 
More noticeable glow. Lifts 2px. Not brighter in a glaring way — wider spread, higher opacity. The difference between resting and hover should be readable, not dramatic.
 
### 5.5 Logo + Text (Desktop Only)
 
Logo and text sit in a shared invisible container. The interaction area spans from the left edge of the logo to the right edge of the last letter of the text — including vertical space above and below the text on the right side of the logo.
 
```css
.logo-lockup {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: transform 200ms ease;
}
 
.logo-lockup:hover {
  transform: translateY(-2px);
}
 
.logo-lockup:hover .logo-icon {
  filter: drop-shadow(0 0 14px rgba(249, 115, 22, 0.6));
}
 
.logo-lockup:hover .logo-text {
  /* Text lifts with the container. No glow on text. */
}
 
.logo-icon {
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.35));
  transition: filter 200ms ease;
}
```
 
On hover: the entire lockup lifts. Only the icon glows. Text rides along.
 
### 5.6 Mobile Behavior
 
Logo is always solo on mobile. The lockup (logo + text) is never used in the mobile bottom nav or mobile header. The wordmark "Ledger" may appear as separate text elsewhere on mobile, but it is never attached to the logo icon.
 
### 5.7 Container Color
 
| Page background | Logo container color |
|---|---|
| `#0A0A0A` / `#141414` (dark) | `#000000` or `#111111` |
| `#FAFAFA` / `#FFFFFF` (light) | `#FFFFFF` |
 
The container is a plain rectangle — no border, no visible background unless you are looking for it. Its purpose is to give the SVG a defined rendering surface, not to create a visual element.
 
### 5.8 Visibility in Any Theme
 
Because the logo SVG has no background and the container is neutral, the logo could disappear into the background in certain themes. The glow prevents this. The glow is always slightly contrasted against the environment:
- Dark environment → light glow (orange reads as lighter than the background)
- Light environment → deeper glow (orange reads as darker than the background)
The logo always appears to hover slightly above its surface. It is always findable.
 
---
 
## 6. Component Behavior
 
### 6.1 Buttons
 
**Primary (Orange)**
```css
background: var(--color-orange);
color: var(--color-text-inverse);
border-radius: var(--radius-md);
padding: 10px 20px;
font-weight: var(--weight-semibold);
transition: background 150ms ease, transform 100ms ease;
 
hover: background var(--color-orange-hover), translateY(-1px)
active: translateY(0), brightness(0.95)
disabled: opacity 0.4, cursor not-allowed
```
 
**Secondary / Ghost**
```css
background: transparent;
border: 1px solid var(--color-border-strong);
color: var(--color-text-primary);
 
hover: background var(--color-bg-subtle), border-color var(--color-border-strong)
```
 
**Destructive**
```css
background: var(--color-red-muted);
border: 1px solid var(--color-red);
color: var(--color-red);
 
hover: background var(--color-red), color white
```
 
All buttons: minimum height 40px (desktop), 44px (mobile).
 
### 6.2 Inputs
 
```css
background: var(--color-bg-surface);
border: 1px solid var(--color-border);
border-radius: var(--radius-md);
padding: 10px 14px;
color: var(--color-text-primary);
font-size: var(--text-base);
transition: border-color 150ms ease;
 
focus: border-color var(--color-orange), outline 2px solid var(--color-focus-ring), outline-offset 2px
error: border-color var(--color-red)
disabled: opacity 0.5, cursor not-allowed
```
 
Placeholder text: `--color-text-tertiary`. Always. Never the same color as filled text.
 
Amount input: font Inter, `tabular-nums`, `--text-lg`, semibold. The amount field is the most important input in the app. It should feel like entering a number matters.
 
### 6.3 Cards
 
```css
background: var(--color-bg-surface);
border: 1px solid var(--color-border);
border-radius: var(--radius-lg);
padding: var(--space-4) var(--space-5);
```
 
Interactive cards (tappable):
```css
transition: background 150ms ease, border-color 150ms ease;
hover: background var(--color-bg-elevated), border-color var(--color-border-strong)
active: scale(0.99)
```
 
### 6.4 Bottom Sheets
 
- Background: `--color-bg-elevated`
- Border radius: `--radius-lg` on top corners only
- Drag handle: 32px × 4px pill, `--color-border-strong`, centered top
- Backdrop: `rgba(0,0,0,0.6)`, blurred `backdrop-filter: blur(4px)`
- Animation: slides up from bottom, 250ms ease-out. Dismisses with 200ms ease-in downward.
- Dismiss: drag down, tap backdrop, or explicit close button.
### 6.5 Navigation
 
**Bottom Nav (Mobile)**
- Background: `--color-bg-surface` with top border `--color-border`
- 5 items: Dashboard, Transactions, Budgets, Goals, Analytics
- Each item: icon (24px) + label (`--text-xs`)
- Inactive: icon `--color-text-secondary`, label `--color-text-tertiary`
- Active: icon `--color-azure`, label `--color-azure`, `--weight-medium`
- Active indicator: small dot or underline in `--color-azure` below active icon
**Sidebar (Desktop)**
- Background: `--color-bg-surface`, right border `--color-border`
- Logo lockup at top (with text, desktop)
- Nav items: icon (20px) + label
- Inactive: `--color-text-secondary`, hover `--color-text-primary` + `--color-bg-subtle` background
- Active: `--color-azure` text and icon, `--color-azure-muted` background pill
### 6.6 Progress Bars
 
```css
background: var(--color-bg-subtle);    /* Track */
border-radius: var(--radius-full);
height: 6px;
 
/* Fill color logic */
0–74%:   var(--color-azure)   /* Healthy */
75–99%:  var(--color-amber)   /* Warning */
100%+:   var(--color-red)     /* Over budget */
```
 
Animation: width transition 400ms ease when value changes. Smooth, not instant.
 
### 6.7 Progress Rings (Goals)
 
SVG circle rings. Stroke width: 6px. Background track stroke: `--color-border`.
 
Fill color:
- Active goal, under 100%: `--color-azure`
- Completed (100%+): `--color-green`
Center text: percentage, `--font-display`, `--weight-bold`, `--text-sm` (small ring) or `--text-lg` (large ring).
 
Animation: stroke-dashoffset transition 600ms ease-out on mount and on value change.
 
### 6.8 Toast Notifications
 
Position: top-right on desktop, top-center on mobile.
Auto-dismiss: 4 seconds (success), 6 seconds (error, to give time to read).
Manual dismiss: tap/click anywhere on toast.
 
```
Success: green left border, checkmark icon
Error:   red left border, X icon, "Retry" action if applicable
Info:    azure left border, info icon
```
 
No stacking more than 3 toasts. Oldest dismisses first if limit hit.
 
### 6.9 Skeleton Loaders
 
Background: `--color-bg-subtle`.
Shimmer animation: gradient sweep left-to-right, 1.5s infinite.
Shape: must approximate the real content's dimensions. A skeleton for a transaction row looks like a transaction row, not a generic bar.
 
### 6.10 Theme Toggle
 
Icon-only button. Sun icon (Lucide `Sun`) represents light mode is active; moon icon (Lucide `Moon`) represents dark mode is active — the icon shown is the mode currently active, not the mode you'd switch to. This matches the mental model of "this is what's on."
 
```css
size: 36px × 36px (desktop), 40px × 40px (mobile) — meets touch target minimum
background: transparent
border-radius: var(--radius-full)
icon size: 18px (desktop), 20px (mobile)
color: var(--color-text-secondary)
 
hover: background var(--color-bg-subtle), color var(--color-text-primary)
active/pressed: scale(0.92), duration var(--duration-fast)
```
 
**Transition on toggle:** icon cross-fades and rotates slightly (sun/moon swap), duration `--duration-base` (150ms). The rest of the app's colors transition using the same duration on `background-color`, `border-color`, and `color` properties app-wide — applied via a global transition rule scoped to theme-relevant properties only, not `all` (avoids janky transitions on unrelated hover states).
 
```css
:root, [data-theme] {
  transition: background-color var(--duration-base) var(--ease-standard),
              border-color var(--duration-base) var(--ease-standard),
              color var(--duration-base) var(--ease-standard);
}
```
 
**Flash prevention:** the stored theme preference must be read and applied to `data-theme` before first paint — via an inline script in `<head>` or Next.js's theme provider pattern that reads `localStorage` synchronously. A flash of the wrong theme on load is a bug, not a cosmetic detail.
 
**Placement:** see APP_FLOW.md §3.2 for the exact positioning rule (closest to center among top-bar icons, on every page).
 
---
 
## 7. Motion & Animation
 
### 7.1 Principles
- Animation communicates state change, not decoration.
- Nothing animates just because it can.
- All transitions respect `prefers-reduced-motion`. If set, cut all transforms and use opacity-only transitions.
### 7.2 Durations
 
```css
--duration-fast: 100ms;      /* Button press, toggle */
--duration-base: 150ms;      /* Hover states, color transitions */
--duration-moderate: 250ms;  /* Sheet open/close, modal */
--duration-slow: 400ms;      /* Progress bar fill, chart render */
--duration-ring: 600ms;      /* Goal progress ring on mount */
```
 
### 7.3 Easing
 
```css
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);    /* Entering elements */
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);         /* Exiting elements */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1); /* Most transitions */
```
 
### 7.4 Specific Interactions
 
- **FAB tap:** Brief scale down (0.92) on press, release back to 1. 100ms. Feels physical.
- **Transaction row delete (swipe):** Red background reveals at swipe distance >40% of row width. Full swipe or tap confirm removes row with height collapse animation (200ms).
- **Budget card update:** When a new transaction posts to a category, the progress bar animates to new value. The number updates after the animation completes.
- **Sheet dismiss (drag):** Follows finger. If released above 50% screen height, snaps back. Below 50%, dismisses.
- **Page transitions:** None. App Router handles navigation. Do not add page-level transitions in v1 — they add complexity and rarely feel good in finance apps.
---
 
## 8. Iconography
 
- **Icon library:** Lucide React. Consistent stroke width, clean geometry.
- **Standard size:** 20px (nav, cards, buttons). 16px (inline with text). 24px (FAB- **No icon without meaning.** If you're adding an icon for visual interest, remove it.
Category icons: subset of Lucide icons assigned per category type. Rendered in a neutral circle (40px, `border-radius: full`, background `var(--color-neutral-muted)`). Default/uncolored categories use `--color-neutral-muted` background + category color dot/icon signal.
 
---
 
## 9. Data Visualization (Charts)
 
All charts: Recharts. Dark mode by default — background transparent, grid lines `--color-border`, tooltip `--color-bg-elevated`.
 
### Chart Colors (Ordered by Usage Frequency)
 
```
1. --color-azure        (primary spend category, most-used series)
2. --color-orange       (secondary series)
3. --color-green        (income series)
4. #A78BFA              (violet — tertiary category)
5. #FB923C              (light orange — quaternary)
6. #34D399              (emerald — quinary)
```
 
Never use red or amber as a chart series color — those are reserved for semantic states.
 
### Tooltip
- Background: `--color-bg-elevated`
- Border: `--color-border-strong`
- Amount formatted via `formatNGN()`
- Border radius: `--radius-md`
### Bar Charts
- Bar fill: uses chart color series above
- Hover: bar brightens, tooltip appears
- No gridlines on Y axis if bars are horizontal
### Line Charts
- Stroke: `--color-azure`, 2px
- Dots: only on data points with value (no empty dots)
- Area fill under line: `--color-azure` at 10% opacity
---
 
## 10. Empty & Error State Design
 
### Empty States
Every empty state has:
1. An icon (48px, `--color-text-tertiary`)
2. A heading (what is missing, not "No data found")
3. A single action — button or link to fix it
Example — empty transaction list:
- Icon: receipt icon
- Heading: "No transactions yet"
- Action: "Log your first expense" → triggers FAB / Quick Add sheet
Empty states must not feel like errors. They are the starting point.
 
### Error States
Every error state has:
1. An icon (warning or X, `--color-red`)
2. A brief message ("Couldn't load transactions")
3. A "Retry" button that re-fires the query
4. Never exposes raw error messages or stack traces to the UI
---
 
## 11. Responsive Breakpoints
 
```css
/* Mobile first */
default:     0px+       /* Single column, bottom nav, solo logo */
sm:          640px+     /* Slight layout expansion, wider cards */
md:          768px+     /* Sidebar appears, bottom nav hidden, logo lockup */
lg:          1024px+    /* Two-column dashboard layout */
xl:          1280px+    /* Max-width container kicks in, content centered */
```
 
---
 
## 12. Reusable UI Patterns
 
- **Card shell pattern:** Title + "View all →" link top-right, consistent padding (`p-4 md:p-5`), radius (`rounded-xl`), and shadow (`shadow-card`).
- **Empty-state-with-CTA pattern:** Shared empty state layout with subtle icon/heading, action CTA link ("Add a budget →", "Create one →"), and consistent border/background treatment.
- **Progress ring pattern:** Standardized circular progress indicator using `--color-azure` stroke, `ProgressRing` component.
- **Flow-line + icon + neutral-amount-color system:** Left accent line encodes flow direction (green = income, amber = expense); neutral background category circle; plain white/neutral amount text for expenses, green text for income.
 
---
 
*When an implementation decision about color, spacing, motion, or component behavior is not covered here, the answer is always: match the CodeRabbit dark mode aesthetic — restrained, precise, purposeful. If you are adding something because it looks cool, remove it.*

# Design

This document defines the visual system, style tokens, and component guidelines for the Ledger interface.

## Color Tokens

The visual theme defaults to a dark charcoal base accented by azure blue and selective orange indicators. Colors are mapped via CSS variables in [globals.css](file:///home/redmane/Documents/Port%20Sites/Category%205/Ledger/app/globals.css).

### Base (Dark Mode)
- **Base Background:** `#0A0A0A` (`--color-bg-base`) — Deep, solid canvas.
- **Surface Background:** `#141414` (`--color-bg-surface`) — Panel cards, sheets, lists.
- **Elevated Background:** `#1C1C1C` (`--color-bg-elevated`) — Modals, dropdown lists.
- **Subtle Hover:** `#232323` (`--color-bg-subtle`) — Row hover states.
- **Border:** `#2A2A2A` (`--color-border`) — Low-contrast dividers.
- **Strong Border:** `#3A3A3A` (`--color-border-strong`) — Focused or high-contrast borders.

### Accents
- **Primary Accent (Orange):** `#F97316` (`--color-orange`) — Primary button hover outlines and focal highlights.
- **Secondary Accent (Azure):** `#38BDF8` (`--color-azure`) — Active navigation routes and healthy goals.

### Semantic States
- **Income / Positive:** `#22C55E` (`--color-green`)
- **Warning (>=75% spent):** `#F59E0B` (`--color-amber`)
- **Overspent / Danger:** `#EF4444` (`--color-red`)

---

## Typography

We employ a dual-font configuration centered on readability and serious developer-grade polish.

- **Display & Headings:** `Space Grotesk` (`--font-display`) — Scaled from `text-lg` (18px) to `text-3xl` (30px). High weight (bold), minimal tracking (`-0.02em` to `-0.04em`).
- **Body & Inputs:** `Inter` (`--font-body`) — Regular and medium weights. Used for text descriptions and tabular layouts.
- **Monetary Amounts:** Inter with strict tabular alignment properties (`font-variant-numeric: tabular-nums`).

---

## Component Guidelines

### Buttons
- **Primary (Orange):** `height: 44px` (mobile), semibold weight, white text. Animates with a subtle scale down (`0.95`) on click.
- **Secondary / Ghost:** Transparent background with border-strong (`#3A3A3A`), hover highlights using `--color-bg-subtle`.
- **Destructive:** Red outline with `--color-red-muted` background fill.

### Forms & Inputs
- **Base Style:** Background `--color-bg-surface`, border `--color-border`.
- **Amount Input:** Rendered in large, bold Inter text (`--text-lg`), autofocusing the viewport keyboard immediately upon sheet trigger.
- **Focus Ring:** Outlined with `2px solid var(--color-orange)` to prevent cognitive confusion with red validation errors.

### Cards & Sheets
- **Radius Constraints:** Cards utilize a strict border radius of `10px` (`--radius-md`) or `14px` (`--radius-lg`). Over-rounding (>16px) is banned.
- **Bottom Sheets:** Elevated backgrounds (`--color-bg-elevated`) sliding smoothly from the bottom with a blurred overlay backdrop.

---

## Layout & Structure

- **Desktop (>=768px):** Sticky vertical Sidebar navigation (`width: 240px`). Content constrained to a centered container (`max-width: 1100px`).
- **Mobile (<768px):** Mobile Bottom Nav (`height: 64px`) and solo logo header. Interactive targets must maintain a minimum clickable area of `44x44px`.

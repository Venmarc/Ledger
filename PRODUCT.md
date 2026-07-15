# Product

## Register

product

## Users
- Primary: Nigerian tech professionals and students fighting high inflation.
- Context: Logging expenses quickly on mobile viewports under busy daily routines.
- Job to be Done: Track every single Naira transaction with high confidence, visualize money leaks, and stick to strict category budgets without friction.

## Product Purpose
Ledger is a personal finance OS designed specifically for Nigerian realities. It aims to offer lightweight, lightning-fast expense logging, precise budgeting, and savings projections, demonstrating fintech-grade precision, fast responsiveness, and trustworthy analytical depth.

## Brand Personality
- Serious (Bloomberg terminal-like, focused on data density and absolute clarity).
- Precise (clean geometric divisions, sharp lines, zero decorative fluff).
- Professional (CodeRabbit-inspired dark charcoal background with targeted highlights, never cartoonish).

## Anti-references
- SaaS-cream/beige templates: Saturated, overly warm AI design-monoculture templates that look like generic startups.
- Rainbow grids: Endless repetitions of cards with mismatched colorful illustrations.
- Over-rounded cards: Soft, childish designs with card radii >16px.
- Meaningless sparkles: Cluttered visual accents that carry no real information.

## Design Principles
1. **Visual Restraint / Focus:** Spacing and typography hierarchy must direct attention to the critical numbers. Every panel earns its place.
2. **Confidence via Precision:** Numbers are rendered in clean, tabular figures (`font-variant-numeric: tabular-nums`). Red is reserved strictly for warning/exceeded budgets; orange acts as the focus highlight.
3. **Speed is Trust:** Logging an expense must be effortless and feel instant. Micro-interactions must feel snappy (durations <= 150ms).
4. **Context over Decoration:** Visual elements (icons, badges, progress rings) carry meaning. We show budget warning thresholds (amber at 75%, red at 100%) rather than generic progress bars.

## Accessibility & Inclusion
- Contrast: Body text contrast must maintain ≥4.5:1 against the charcoal base; placeholders must also meet this threshold.
- Color alone never conveys meaning: Warning states must use both colors (amber/red) and explicit text labels or percentages.
- Reduced Motion: Respect `prefers-reduced-motion` across all transition animations.

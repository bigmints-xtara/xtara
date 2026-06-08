# ADR-005: Radix UI + Tailwind CSS v4 as UI Foundation

## Status: Accepted (2024-12)

## Context
The project needed a component library for consistent UI. Options included MUI, Chakra UI, Radix UI, and Headless UI.

## Decision
Use **Radix UI** primitives + **Tailwind CSS v4** + **class-variance-authority** (CVA) + **clsx**.

## Rationale
1. **Headless Primitives:** Radix UI provides unopinionated components (Avatar, Dropdown, Select, Progress) — full control over styling.
2. **Tailwind CSS v4:** Fast compilation, CSS variables for design tokens.
3. **CVA:** `class-variance-authority` enables reusable component variants (Button sizes, Badge colors).
4. **Lightweight:** Radix + Tailwind is ~30% smaller than MUI + Emotion.

## Consequences
### Positive
- Pixel-perfect UI control (no overriding MUI's CSS modules).
- Tailwind v4 is significantly faster (CSS variables, zero-runtime).
- Small bundle size.

### Negative
- More boilerplate: Each Radix component needs custom Tailwind classes.
- No pre-built dashboard components (Admin pages need custom layout).
- Tailwind v4 migration required (PostCSS config, CSS file changes).

### Not Done
- No design system documentation for Radix components.
- No storybook for component preview.
- Not all Radix components are used (only 6 of 20+ primitives).

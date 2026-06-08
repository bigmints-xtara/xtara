# ADR-002: Client Components as Primary Rendering Strategy

## Status: Accepted (2024-12)

## Context
Next.js 16 supports the App Router with Server Components, Server Actions, and hybrid rendering. However, the majority of the codebase uses `"use client"` directives.

## Decision
Use **Client Components** as the primary rendering strategy. Server Components are used only for `layout.tsx` (metadata, locale) and static marketing pages.

## Rationale
1. **Firebase SDK:** `firebase/auth` and `firebase/firestore` are client-side SDKs (rely on `onAuthStateChanged`).
2. **State Management:** `AuthProvider` and `LanguageProvider` use React Context — naturally client-side.
3. **Flutter Parity:** Component-driven architecture maps 1:1 to React client components.
4. **Framer Motion:** Animation library works best with client-side rendering.

## Consequences
### Positive
- Simpler component model (no Server/Client boundary complexity).
- Direct Firebase SDK usage (no serialization/deserialization).
- Framer Motion animations work out of the box.

### Negative
- Reduced SEO (most pages are client-rendered).
- Larger initial JS bundle (all Firebase + React + Framer Motion loaded).
- No Server-Side Rendering for career pages (critical content for SEO).
- Waterfall queries (each component fetches independently).

### Not Done
- No Server Actions for writes (e.g., `saveAssessment` is called directly from client).
- No incremental static regeneration (ISR) for career detail pages.

# ADR-003: Firestore as Primary Data Layer (over REST API)

## Status: Accepted (2024-12)

## Context
The application could use either a REST API (via Next.js API Routes) or direct Firestore SDK access from the client.

## Decision
Use **direct Firestore SDK** from client components. No intermediate API layer.

## Rationale
1. **Speed to Market:** Direct SDK access means `getDocs(query(collection(db, 'X')))` — no API route boilerplate.
2. **Flutter Parity:** The Flutter app reads the same collections, enabling shared schema.
3. **Real-time Potential:** `onSnapshot()` enables live updates (stories, challenges) without WebSocket setup.

## Consequences
### Positive
- Minimal data layer boilerplate.
- Shared schema between Web and Flutter.
- Native real-time queries available.

### Negative
- N+1 queries: Each component issues its own `getDocs()` — no batching.
- No caching: No React Query or SWR wrapping → redundant network calls.
- Firestore limits: Each query counts against Firestore read quota.
- Client-side data transforms (e.g., `parseCourseName()`) run on every render.

### Not Done
- No React Query wrapper for Firestore reads.
- No Firestore transaction support (e.g., `saveAssessment` + `getUserProfile` are sequential).
- No compound indexes defined (e.g., `assessmentId` + `createdAt`).

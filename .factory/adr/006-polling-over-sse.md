# ADR-006: Polling for Career Path over Server-Sent Events

## Status: Accepted (2024-12)

## Context
After saving an assessment, the backend Cloud Function (`generateCareerPathRAG`) processes the data. The frontend needs to know when the career path is ready.

## Decision
Use **busy-polling** via `waitForCareerPath()` — query Firestore every 2 seconds for up to 60 seconds.

## Rationale
1. **Simplicity:** No WebSocket server or SSE endpoint needed.
2. **Firestore-native:** `where('assessmentId', '==', userId)` query is straightforward.
3. **Cloud Function latency:** RAG pipeline typically takes 5–15 seconds (within 60s window).

## Consequences
### Positive
- Simple to implement (30 lines of code).
- Works across network boundaries (no sticky sessions).
- Auto-updates user profile with `pendingCareerPathId`.

### Negative
- ~60 seconds max wait (30 attempts × 2s) — no exponential backoff.
- Each poll is a Firestore read (costs $0.024/100,000 reads).
- User sees "Processing..." spinner with minimal feedback.

### Not Done
- No exponential backoff (2s → 4s → 8s → 16s).
- No Server-Sent Events endpoint (`/api/assessments/{id}/status`).
- No real-time Firestore listener (`onSnapshot()`).

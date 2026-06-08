# ADR-001: Firebase Auth as Primary Authentication (over NextAuth)

## Status: Accepted (2024-12)

## Context
The project lists both `firebase/auth` and `next-auth` as dependencies. The primary auth flow uses `Firebase Auth` with `onAuthStateChanged` wrapped in a React Context (`AuthProvider`). NextAuth v4 is installed but minimally used.

## Decision
Use **Firebase Auth** as the primary authentication mechanism with `AuthProvider` context. NextAuth remains as a fallback/future migration path.

## Rationale
1. **Anonymous Sign-In:** Firebase's `signInAnonymously()` is critical for the assessment flow — users start answering questions before committing to an email.
2. **Anonymous-to-Email Conversion:** `linkWithCredential()` seamlessly links an anonymous user's Email provider without losing Firestore doc.
3. **Firestore Integration:** Firebase Auth UID maps directly to Firestore `users/{uid}` — reduces join operations.
4. **Flutter Parity:** The Flutter web app uses the same Firebase project, sharing the `auth.currentUser` pattern.

## Consequences
### Positive
- Zero-config auth state propagation across the app.
- Seamless anonymous → email conversion preserves `pendingCareerPathId`.
- Single Firebase project for Auth, Firestore, and Storage.

### Negative
- NextAuth v4 is a "zombie" dependency (imports `next-auth` but uses Firebase `auth`).
- No server-side session check (all auth is client-side `onAuthStateChanged`).
- Waterfall: `onAuthStateChanged` → `getUserProfile` → `setUserProfile` (can freeze UI for ~500ms).

### Not Done
- NextAuth Provider not mounted in layout.
- No JWT-based server-side session validation (e.g., `getServerSession()`).

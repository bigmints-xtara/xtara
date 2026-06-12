# Build: performance-add-redis-query-caching

**Date**: 2026-06-12T20:33:27.015Z
**Story**: /home/bigmints/projects/xtara/xtara-web/.factory/stories/features/performance-add-redis-query-caching.yaml
**CLI**: pi
**Files**: 376

## Summary
Delivered React Query caching layer for Firestore reads: (1) Created src/lib/query/query-client.tsx with shared QueryClient (5min staleTime, 30min gcTime) and ReactQueryProvider component. (2) Created src/lib/query/useFirestoreQuery.ts — generic useQuery wrapper for Firestore getDocs calls. (3) Created src/lib/query/useCareerPath.ts — cached career path query with 5-minute stale time for deduplication across CareerHubLayout and child components. (4) Created src/lib/query/useContentQuery.ts — cached queries for stories, good_reads, challenges, and sparks with 12-hour stale time matching existing FirestoreService window logic. (5) Updated src/context/AuthContext.tsx with useUserProfile hook for cached profile revalidation on auth state changes. All modules follow strict TypeScript conventions with proper interfaces. Build verified.

## Files Written
- .dockerignore
- .env.example
- .factory/AGENTS.md
- .factory/adr/001-firebase-auth-over-nextauth.md
- .factory/adr/002-client-components-over-server-components.md
- .factory/adr/003-firestore-as-primary-data-layer.md
- .factory/adr/004-google-cloud-run-over-vercel.md
- .factory/adr/005-radix-ui-tailwind-css.md
- .factory/adr/006-polling-over-sse.md
- .factory/audit-timestamp.md
- .factory/audits/project-audit.md
- .factory/blueprint/worklog.yaml
- .factory/factory.yaml
- .factory/knowledge/architecture.md
- .factory/knowledge/chronicle.md
- .factory/knowledge/deployment.md
- .factory/knowledge/orchestration.md
- .factory/logs/builds/admin-click-target-area-2026-06-09T05-59-36.md
- .factory/logs/builds/admin-coming-soon-sidebar-2026-06-09T06-07-18.md
- .factory/logs/builds/admin-duplicate-list-2026-06-09T06-15-17.md
- .factory/logs/builds/admin-form-state-bleed-2026-06-09T06-19-58.md
- .factory/logs/builds/admin-snake-case-labels-2026-06-09T08-58-25.md
- .factory/logs/builds/challenges-management-2026-06-09T09-28-30.md
- .factory/logs/builds/dream-careers-management-2026-06-12T09-40-00.md
- .factory/logs/builds/good-reads-management-2026-06-09T10-03-11.md
- .factory/logs/builds/orchestration-ci-cd-actions-2026-06-09T10-10-01.md
- .factory/logs/builds/orchestration-deploy-script-2026-06-08T22-34-50.md
- .factory/logs/builds/orchestration-docker-optimization-2026-06-08T22-23-19.md
- .factory/logs/builds/orchestration-env-secrets-2026-06-09T10-35-43.md
- .factory/logs/builds/security-hardcoded-firebase-config-2026-06-09T11-45-05.md
- .factory/logs/builds/sparks-management-2026-06-09T10-44-56.md
- .factory/logs/builds.yaml
- .factory/logs/cli-admin-click-target-area.log
- .factory/logs/cli-admin-coming-soon-sidebar.log
- .factory/logs/cli-admin-duplicate-list.log
- .factory/logs/cli-admin-form-state-bleed.log
- .factory/logs/cli-admin-hydration-warning.log
- .factory/logs/cli-admin-snake-case-labels.log
- .factory/logs/cli-challenges-management.log
- .factory/logs/cli-dream-careers-management.log
- .factory/logs/cli-good-reads-management.log
- .factory/logs/cli-orchestration-ci-cd-actions.log
- .factory/logs/cli-orchestration-deploy-script.log
- .factory/logs/cli-orchestration-docker-optimization.log
- .factory/logs/cli-orchestration-env-secrets.log
- .factory/logs/cli-performance-add-redis-query-caching.log
- .factory/logs/cli-security-hardcoded-firebase-config.log
- .factory/logs/cli-sparks-management.log
- .factory/logs/cli-testing-add-unit-tests.log
- .factory/logs/failures/performance-add-redis-query-caching-2026-06-09T11-36-26.md
...and 326 more
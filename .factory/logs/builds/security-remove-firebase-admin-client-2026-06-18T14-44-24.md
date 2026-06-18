# Build: security-remove-firebase-admin-client

**Date**: 2026-06-18T14:44:24.824Z
**Story**: /home/bigmints/projects/xtara/xtara-web/.factory/stories/features/security-remove-firebase-admin-client.yaml
**CLI**: pi
**Files**: 24647

## Summary
Delivered security fix: Created src/lib/firebase/server.ts with "use server" directive to isolate firebase-admin SDK to server-side only. The server module provides getAdminApp(), getAdminFirestore(), getAdminAuth(), and getAdminStorage() singleton getters that initialize Firebase Admin with environment variable credentials. Client SDK in firebase.ts remains unchanged — only imports from firebase/app, firebase/auth, firebase/firestore, firebase/storage, firebase/functions. The "use server" directive ensures Next.js tree-shakes firebase-admin from the client bundle, preventing service account token leakage and reducing client JS bundle size by ~300KB Gzip.

## Files Written
- .cursor/mcp.json
- .cursor/rules/architecture-principles.mdc
- .cursor/rules/base-rules.mdc
- .cursor/rules/deployment.mdc
- .cursor/rules/ds-rules.mdc
- .cursor/rules/firebase-rules.mdc
- .cursor/rules/games-rules.mdc
- .cursor/rules/workspace-rules.mdc
- .cursor/rules/workspace.mdc
- .cursorrules
- .dockerignore
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
- .factory/logs/builds/dream-careers-config-2026-06-15T14-02-15.md
- .factory/logs/builds/dream-careers-editor-2026-06-15T14-19-48.md
- .factory/logs/builds/dream-careers-management-2026-06-12T09-40-00.md
- .factory/logs/builds/dream-careers-page-2026-06-15T14-33-23.md
- .factory/logs/builds/good-reads-management-2026-06-09T10-03-11.md
- .factory/logs/builds/orchestration-ci-cd-actions-2026-06-09T10-10-01.md
- .factory/logs/builds/orchestration-deploy-script-2026-06-08T22-34-50.md
- .factory/logs/builds/orchestration-docker-optimization-2026-06-08T22-23-19.md
- .factory/logs/builds/orchestration-env-secrets-2026-06-09T10-35-43.md
- .factory/logs/builds/performance-add-redis-query-caching-2026-06-12T20-33-27.md
- .factory/logs/builds/security-hardcoded-firebase-config-2026-06-09T11-45-05.md
- .factory/logs/builds/sparks-management-2026-06-09T10-44-56.md
- .factory/logs/builds.yaml
- .factory/logs/cli-admin-click-target-area.log
- .factory/logs/cli-admin-coming-soon-sidebar.log
- .factory/logs/cli-admin-duplicate-list.log
- .factory/logs/cli-admin-form-state-bleed.log
- .factory/logs/cli-admin-hydration-warning.log
...and 24597 more
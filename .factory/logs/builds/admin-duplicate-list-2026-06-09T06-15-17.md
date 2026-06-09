# Build: admin-duplicate-list

**Date**: 2026-06-09T06:15:17.308Z
**Story**: /home/bigmints/projects/xtara/xtara-web/.factory/stories/features/admin-duplicate-list.yaml
**CLI**: pi
**Files**: 325

## Summary
Fixed duplicate data in admin story list. Modified AdminMasterDetail.tsx to deduplicate entities by ID in the streamAll callback using reduce + Object.values pattern. This prevents React Strict Mode double-mounting from creating duplicate entries. Fix applies to all admin entity types (Stories, Good Reads, Challenges, Sparks) since they share the AdminMasterDetail component.

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
- .factory/logs/builds/orchestration-deploy-script-2026-06-08T22-34-50.md
- .factory/logs/builds/orchestration-docker-optimization-2026-06-08T22-23-19.md
- .factory/logs/builds.yaml
- .factory/logs/cli-admin-click-target-area.log
- .factory/logs/cli-admin-coming-soon-sidebar.log
- .factory/logs/cli-admin-duplicate-list.log
- .factory/logs/cli-orchestration-deploy-script.log
- .factory/logs/cli-orchestration-docker-optimization.log
- .factory/logs/heartbeat.yaml
- .factory/logs/state.yaml
- .factory/logs/worklog.yaml
- .factory/run-app.log
- .factory/scaffold.yaml
- .factory/skill-index.yaml
- .factory/skills
- .factory/stories/done/admin-click-target-area.yaml
- .factory/stories/done/admin-coming-soon-sidebar.yaml
- .factory/stories/done/orchestration-deploy-script.yaml
- .factory/stories/done/orchestration-docker-optimization.yaml
- .factory/stories/features/admin-duplicate-list.yaml
- .factory/stories/features/admin-form-state-bleed.yaml
- .factory/stories/features/admin-hydration-warning.yaml
- .factory/stories/features/admin-snake-case-labels.yaml
- .factory/stories/features/challenges-management.yaml
- .factory/stories/features/data-deduplicate-careerpath-interface.yaml
- .factory/stories/features/data-firestore-index-career-paths.yaml
- .factory/stories/features/dream-careers-management.yaml
- .factory/stories/features/good-reads-management.yaml
- .factory/stories/features/orchestration-ci-cd-actions.yaml
- .factory/stories/features/orchestration-env-secrets.yaml
- .factory/stories/features/performance-add-redis-query-caching.yaml
...and 275 more
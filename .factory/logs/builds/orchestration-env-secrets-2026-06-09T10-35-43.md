# Build: orchestration-env-secrets

**Date**: 2026-06-09T10:35:43.458Z
**Story**: /home/bigmints/projects/xtara/xtara-web/.factory/stories/features/orchestration-env-secrets.yaml
**CLI**: pi
**Files**: 348

## Summary
Delivered Secret Manager migration for xtara-web: (1) `scripts/manage-secrets.sh` — full CLI for managing GCP Secret Manager secrets (init, add, list, deploy, cleanup, status commands with --project/--region/--service flags). (2) `set-env.sh` — deprecated with prominent banner and --migrate flag for migration path. (3) `deploy.sh` — added --use-secrets flag to mount secrets on Cloud Run. (4) `.env.example` — updated with [SECRET] annotations and Secret Manager header. (5) `SECRETS.md` — comprehensive documentation covering overview, prerequisites, IAM roles, migration guide, rollback procedure, and CLI reference. All scripts pass bash syntax checks and npm build succeeds.

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
- .factory/logs/builds/good-reads-management-2026-06-09T10-03-11.md
- .factory/logs/builds/orchestration-ci-cd-actions-2026-06-09T10-10-01.md
- .factory/logs/builds/orchestration-deploy-script-2026-06-08T22-34-50.md
- .factory/logs/builds/orchestration-docker-optimization-2026-06-08T22-23-19.md
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
- .factory/logs/heartbeat.yaml
- .factory/logs/state.yaml
- .factory/logs/worklog.yaml
- .factory/run-app.log
- .factory/scaffold.yaml
- .factory/skill-index.yaml
- .factory/skills
- .factory/stories/done/admin-click-target-area.yaml
- .factory/stories/done/admin-coming-soon-sidebar.yaml
...and 298 more
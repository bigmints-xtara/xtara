# Build: orchestration-deploy-script

**Date**: 2026-06-08T22:34:50.316Z
**Story**: /home/bigmints/projects/xtara/xtara-web/.factory/stories/features/orchestration-deploy-script.yaml
**CLI**: pi
**Files**: 318

## Summary
Rewrote deploy.sh with three key improvements: (1) Replaced hardcoded service account key with Application Default Credentials (ADC) and Workload Identity Federation support, (2) Replaced standard docker build with docker buildx build for multi-platform ARM/AMD64 builds with BuildKit caching, (3) Changed artifact target from default cloud-run-source-deploy to dedicated xtara-web-artifacts repository with git-hash+timestamp version tags. Script includes --version, --dry-run flags, strict error handling, and clear section headers. Also updated DEPLOYMENT.md documentation.

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
- .factory/logs/builds/orchestration-docker-optimization-2026-06-08T22-23-19.md
- .factory/logs/builds.yaml
- .factory/logs/cli-orchestration-deploy-script.log
- .factory/logs/cli-orchestration-docker-optimization.log
- .factory/logs/heartbeat.yaml
- .factory/logs/state.yaml
- .factory/logs/worklog.yaml
- .factory/run-app.log
- .factory/scaffold.yaml
- .factory/skill-index.yaml
- .factory/skills
- .factory/stories/done/orchestration-docker-optimization.yaml
- .factory/stories/features/admin-click-target-area.yaml
- .factory/stories/features/admin-coming-soon-sidebar.yaml
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
- .factory/stories/features/orchestration-deploy-script.yaml
- .factory/stories/features/orchestration-env-secrets.yaml
- .factory/stories/features/performance-add-redis-query-caching.yaml
- .factory/stories/features/security-hardcoded-firebase-config.yaml
- .factory/stories/features/security-remove-firebase-admin-client.yaml
- .factory/stories/features/sparks-management.yaml
- .factory/stories/features/testing-add-unit-tests.yaml
- .factory/task-manager/manage.sh
- .factory/task-manager/queue.yaml
...and 268 more
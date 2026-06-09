# Build: orchestration-ci-cd-actions

**Date**: 2026-06-09T10:10:01.638Z
**Story**: /home/bigmints/projects/xtara/xtara-web/.factory/stories/features/orchestration-ci-cd-actions.yaml
**CLI**: pi
**Files**: 344

## Summary
Created .github/workflows/deploy.yml — a complete GitHub Actions CI/CD pipeline that automatically deploys xtara-web to Google Cloud Run on merges to main. The workflow uses OIDC keyless authentication (google-github-actions/auth@v2), Docker Buildx for multi-platform image builds (docker/build-push-action@v5), and deploys to Cloud Run (google-github-actions/deploy-cloudrun@v2). Includes versioned image tagging (<git-sha>-<timestamp>), Artifact Registry push, and detailed OIDC setup instructions in comments. User needs to replace <PROJECT_NUMBER> placeholder with their actual GCP project number and set up the Workload Identity Pool in GCP IAM.

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
- .factory/logs/heartbeat.yaml
- .factory/logs/state.yaml
- .factory/logs/worklog.yaml
- .factory/run-app.log
- .factory/scaffold.yaml
- .factory/skill-index.yaml
- .factory/skills
- .factory/stories/done/admin-click-target-area.yaml
- .factory/stories/done/admin-coming-soon-sidebar.yaml
- .factory/stories/done/admin-duplicate-list.yaml
- .factory/stories/done/admin-form-state-bleed.yaml
...and 294 more
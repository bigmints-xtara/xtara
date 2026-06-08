# ADR-004: Google Cloud Run over Vercel

## Status: Accepted (2024-12)

## Context
Next.js apps are commonly deployed to Vercel or Google Cloud Run.

## Decision
Deploy to **Google Cloud Run** using a multi-stage Dockerfile.

## Rationale
1. **Cost:** Cloud Run scales to 0 instances (free when idle).
2. **Proximity to Backend:** Firebase project lives in the same GCP project.
3. **Container Flexibility:** Multi-stage build produces a ~50MB standalone image.
4. **Existing Deployment Script:** deploy.sh is battle-tested.

## Consequences
### Positive
- Shared GCP ecosystem (Firebase, Cloud Run, Artifact Registry).
- Predictable pricing (per-second billing, scales to zero).
- Full Docker control (env vars, cache mounts, multi-stage builds).

### Negative
- Manual deployment (no built-in git-push-to-deploy like Vercel).
- No built-in CDN (serves from one region, us-central1).
- No automatic preview deployments.

### Not Done
- No GitHub Actions CI/CD pipeline.
- No per-revision rollback automation.
- No custom domain mapping.

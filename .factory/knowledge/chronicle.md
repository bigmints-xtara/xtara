# REPOSITORY ARCHITECTURAL CHRONICLE
## 1. Architectural Context & Key ADR Highlights
- **Core Stack**: Next.js (Turbopack, Standalone Output), Node 20 (Alpine), Firebase (Auth/Storage/Analytics), NextAuth, Algolia.
- **Deployment Target**: Google Cloud Run (`us-central1`) via Artifact Registry (`us-docker.pkg.dev`).
- **Build Orchestration**: Multi-stage Docker (`deps` → `builder` → `runner`). Local dev via `start.sh` (port 5077). CI/CD driven by `deploy.sh`.
- **Key Decisions**:
  - Deterministic dependency resolution via `npm ci` in `deps` stage.
  - Aggressive `.dockerignore` strategy to minimize build context (~40 rules covering modules, caches, IDE, env, logs, scripts).
  - Next.js standalone output to strip `node_modules` bloat in final runner stage.
  - Environment isolation: Client (`NEXT_PUBLIC_*`) vs Server (`NEXTAUTH_*`, `NODE_ENV`) scoping.

## 2. Chronology of Major Milestones & What Worked
- **2026-06-08 | Orchestration & Docker Optimization**:
  - *Action*: Refactored `Dockerfile` (`npm install` → `npm ci`) and expanded `.dockerignore`.
  - *Outcome*: Deterministic builds, reduced context size, successful Turbopack compilation (35 static pages, 662 packages). Verified via `docker build --progress=plain`. Pipeline stabilized for Cloud Run deployment.

## 3. Failure Post-Mortems & Anti-Patterns
- **Non-Deterministic Dependency Resolution**:
  - *Symptom*: `npm install` in Docker `deps` stage caused intermittent version drift, cache invalidation, and bloated `node_modules`.
  - *Fix*: Enforced `npm ci` aligned with `package-lock.json`; added pre-install cleanup to guarantee idempotent resolution.
- **Bloated Docker Build Context**:
  - *Symptom*: Minimal `.dockerignore` pulled redundant files (`.next`, `.git`, IDE configs, logs), increasing build time and layer caching inefficiency.
  - *Fix*: Implemented comprehensive ignore list targeting build artifacts, environment files, version control, and deployment scripts.
- **Status**: No critical runtime/compile failures logged; optimization phase resolved structural anti-patterns and stabilized CI/CD pipeline.

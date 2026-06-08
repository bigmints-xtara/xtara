# REPOSITORY ARCHITECTURAL CHRONICLE
## 1. Architectural Context & Key ADR Highlights
- **Application Domain**: Xtara — AI-powered career discovery platform for Indian students (Grades 10–12). Core journeys: Anonymous Assessment → AI Career Path → Resource Exploration → Profile/Progress Tracking → Admin CMS.
- **Core Stack**: Next.js (Turbopack, Standalone Output), Node 20 (Alpine), Firebase (Auth/Storage/Analytics), NextAuth, Algolia.
- **Deployment Target**: Google Cloud Run (`us-central1`) via Artifact Registry (`us-docker.pkg.dev/.../xtara-web-artifacts`).
- **Build & Orchestration**: Multi-stage Docker (`deps` → `builder` → `runner`). Local dev via `start.sh` (port 5077). CI/CD driven by `deploy.sh` (ADC auth, Docker Buildx, versioned tagging, Cloud Run rollout).
- **Key Decisions**:
  - Deterministic dependency resolution via `npm ci` in `deps` stage.
  - Aggressive `.dockerignore` strategy (~40 rules) to minimize build context.
  - Next.js standalone output to strip `node_modules` bloat in final runner stage.
  - Strict environment isolation: Client (`NEXT_PUBLIC_*`) vs Server (`NEXTAUTH_*`, `NODE_ENV`) scoping.
  - Authentication: Workload Identity Federation (ADC) over legacy service account keys.
  - Artifact Management: Dedicated versioned repo (`xtara-web-artifacts`) with `<git-hash>-<YYYYMMDD-HHMMSS>` tagging to prevent Cloud Run race conditions.

## 2. Chronology of Major Milestones & What Worked
- **2026-06-08 | Orchestration & Docker Optimization**:
  - *Action*: Refactored `Dockerfile` (`npm install` → `npm ci`), expanded `.dockerignore`, and completely rewrote `deploy.sh`.
  - *Outcome*: Deterministic builds, reduced context size, successful Turbopack compilation (35 static pages, 662 packages). `deploy.sh` now supports ADC authentication, Docker Buildx (multi-arch, provenance, cache), dedicated versioned artifact repo, and CLI flags (`--version`, `--dry-run`). Pipeline stabilized for Cloud Run deployment.

## 3. Failure Post-Mortems & Anti-Patterns
- **Non-Deterministic Dependency Resolution**:
  - *Symptom*: `npm install` in Docker `deps` stage caused intermittent version drift, cache invalidation, and bloated `node_modules`.
  - *Fix*: Enforced `npm ci` aligned with `package-lock.json`; added pre-install cleanup to guarantee idempotent resolution.
- **Bloated Docker Build Context**:
  - *Symptom*: Minimal `.dockerignore` pulled redundant files (`.next`, `.git`, IDE configs, logs), increasing build time and layer caching inefficiency.
  - *Fix*: Implemented comprehensive ignore list targeting build artifacts, environment files, version control, deployment scripts, and OS caches.
- **Legacy Authentication & Build Tooling**:
  - *Symptom*: `gcloud auth activate-service-account --key-file` introduced credential friction; `docker build` lacked multi-arch support and cache persistence.
  - *Fix*: Migrated to ADC (`gcloud auth application-default`); replaced with `docker buildx build` featuring `--platform linux/amd64,linux/arm64`, `--provenance=maximum`, and `--cache-from/to` for BuildKit efficiency.
- **Unversioned Artifact Deployment**:
  - *Symptom*: Single `:latest` tag in shared repo caused Cloud Run deployment race conditions and rollback ambiguity.
  - *Fix*: Isolated artifacts to `xtara-web-artifacts` repo; enforced semantic versioning (`<git-hash>-<YYYYMMDD-HHMMSS>`) with explicit `:latest` aliasing.
- **Status**: Optimization phase resolved structural anti-patterns; CI/CD pipeline stabilized with deterministic builds, multi-arch support, and versioned deployment strategy.

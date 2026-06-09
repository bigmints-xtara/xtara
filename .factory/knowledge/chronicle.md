# REPOSITORY ARCHITECTURAL CHRONICLE
## 1. Architectural Context & Key ADR Highlights
- **Application Domain**: Xtara — AI-powered career discovery platform for Indian students (Grades 10–12). Core journeys: Anonymous Assessment → AI Career Path → Resource Exploration → Profile/Progress Tracking → Admin CMS.
- **Core Stack**: Next.js (Turbopack, Standalone Output), Node 20 (Alpine), Firebase (Auth/Storage/Analytics), NextAuth, Algolia.
- **Deployment Target**: Google Cloud Run (`us-central1`) via Artifact Registry (`us-docker.pkg.dev/.../xtara-web-artifacts`).
- **Environment Scoping**:
  - *Client (`NEXT_PUBLIC_*`)*: Firebase config, Algolia search keys, FCM sender ID, Analytics ID.
  - *Server*: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NODE_ENV` (production), `FIREBASE_ADMIN_CREDENTIALS`.
- **UI/Component Standards**: Full-card click targets (`w-full`, `text-left`), semantic accessibility (`role="button"`, `tabIndex={0}`, `aria-pressed`), keyboard navigation (`Enter`/`Space` with `preventDefault`), nested action isolation (`e.stopPropagation()`), explicit focus rings (`focus:ring-2`).
- **Build & Orchestration**: Multi-stage Docker (`deps` → `builder` → `runner`). Local dev via `start.sh` (port 5077). CI/CD driven by `deploy.sh` (ADC auth, Docker Buildx, versioned tagging, Cloud Run rollout).
- **Key Decisions**:
  - Deterministic dependency resolution via `npm ci` in `deps` stage.
  - Aggressive `.dockerignore` strategy (~40 rules) to minimize build context.
  - Next.js standalone output to strip `node_modules` bloat in final runner stage.
  - Authentication: Workload Identity Federation (ADC) over legacy service account keys.
  - Artifact Management: Dedicated versioned repo (`xtara-web-artifacts`) with `<git-hash>-<YYYYMMDD-HHMMSS>` tagging to prevent Cloud Run race conditions.

## 2. Chronology of Major Milestones & What Worked
- **2026-06-08 | Orchestration & Docker Optimization**:
  - *Action*: Refactored `Dockerfile` (`npm install` → `npm ci`), expanded `.dockerignore`, and completely rewrote `deploy.sh`.
  - *Outcome*: Deterministic builds, reduced context size, successful Turbopack compilation (35 static pages, 662 packages). `deploy.sh` now supports ADC authentication, Docker Buildx (multi-arch, provenance, cache), dedicated versioned artifact repo, and CLI flags (`--version`, `--dry-run`). Pipeline stabilized for Cloud Run deployment.
- **2026-06-09 | Admin UI & Accessibility Refactor**:
  - *Action*: Refactored `src/components/admin/AdminListTile.tsx` to enforce full-card interaction models and WCAG compliance.
  - *Outcome*: Implemented unified click targets, semantic ARIA states, keyboard event handling, and nested button isolation. Eliminated hover/focus ambiguity and scroll-jacking on `Space` key. Standardized pattern for all admin list components.

## 3. Failure Post-Mortems & Anti-Patterns
- **Non-Deterministic Dependency Resolution**:
  - *What Failed*: `npm install` in Docker `deps` stage.
  - *Symptom*: Intermittent version drift, cache invalidation, and bloated `node_modules` causing flaky builds.
  - *Fix*: Enforced `npm ci` aligned with `package-lock.json`; added pre-install cleanup to guarantee idempotent resolution.
- **Bloated Docker Build Context**:
  - *What Failed*: Minimal `.dockerignore` strategy.
  - *Symptom*: Redundant files (`.next`, `.git`, IDE configs, logs) pulled into context, increasing build time and layer caching inefficiency.
  - *Fix*: Implemented comprehensive ignore list targeting build artifacts, environment files, version control, deployment scripts, and OS caches (~40 rules).
- **Legacy Authentication & Build Tooling**:
  - *What Failed*: `gcloud auth activate-service-account --key-file` and standard `docker build`.
  - *Symptom*: Credential friction, lack of multi-arch support, and poor cache persistence.
  - *Fix*: Migrated to ADC (`gcloud auth application-default`); replaced with `docker buildx build` featuring `--platform linux/amd64,linux/arm64`, `--provenance=maximum`, and `--cache-from/to` for BuildKit efficiency.
- **Unversioned Artifact Deployment**:
  - *What Failed*: Single `:latest` tag in shared repo.
  - *Symptom*: Cloud Run deployment race conditions and rollback ambiguity.
  - *Fix*: Isolated artifacts to `xtara-web-artifacts` repo; enforced semantic versioning (`<git-hash>-<YYYYMMDD-HHMMSS>`) with explicit `:latest` aliasing.
- **Status**: Optimization phase resolved structural anti-patterns; CI/CD pipeline stabilized with deterministic builds, multi-arch support, versioned deployment strategy, and standardized UI interaction models.

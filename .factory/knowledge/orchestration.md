# Orchestration Context

This document outlines the orchestration and deployment architecture for the `xtara-web` application.

## Overview
The application is a Next.js web application deployed as a containerized service to Google Cloud Run. The orchestration is defined by a set of shell scripts and a Dockerfile.

## Components
1. **Dockerfile**: Uses a multi-stage build (`deps`, `builder`, `runner`) based on `node:20-alpine`. It leverages Next.js standalone output to minimize the final container size.
2. **deploy.sh**: A bash script that:
   - Verifies pre-requisites (`gcloud`, `docker`, service account key).
   - Authenticates with Google Cloud and Configures Docker for Artifact Registry (`us-docker.pkg.dev`).
   - Builds the Docker image locally for `linux/amd64`.
   - Pushes the image to Artifact Registry.
   - Deploys the service to Google Cloud Run (`us-central1`).
3. **start.sh**: A local script used for starting the development server on port 5077 after clearing the `.next` cache.
4. **set-env.sh**: A script used to manually update environment variables on the Cloud Run service.

## Security & Service Accounts
- The deployment uses a hardcoded service account key path (`../credentials/serviceAccountKey_Prod.json`) for authentication.
- The Cloud Run service operates under the `firebase-adminsdk-fbsvc@bigmints-xtara.iam.gserviceaccount.com` service account.

## Current Audit Findings
- **Reproducibility**: Dockerfile relies on `npm install` rather than `npm ci`, which can cause non-deterministic builds.
- **Image Build Architecture**: The local build uses standard `docker build` targeting `linux/amd64`. On ARM-based machines (like Apple Silicon), this uses QEMU and is significantly slower. `docker buildx` should be preferred.
- **CI/CD**: `DEPLOYMENT.md` suggests using GitHub Actions, but `.github/workflows/` does not exist yet. Relying on local deployment scripts creates a single point of failure and bottleneck.
- **Secrets Management**: Environment variables are managed manually via `set-env.sh`. Using Google Cloud Secret Manager would be more secure.
- **Memory Limits**: Cloud Run is provisioned with 512Mi. Next.js standalone builds may sometimes exceed this under heavy SSR loads, potentially causing out-of-memory errors.

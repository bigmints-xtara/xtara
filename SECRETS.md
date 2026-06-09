# GCP Secret Manager — xtara-web

## Overview

Xtara Web uses **Google Cloud Secret Manager** as the primary source of truth for
sensitive environment variables. This replaces the legacy `set-env.sh` approach of
passing env vars directly to Cloud Run.

### Benefits

| Feature | Legacy (`set-env.sh`) | Secret Manager |
|---------|----------------------|----------------|
| Versioning | Manual | Built-in (per secret) |
| IAM Control | Cloud Run service account | Per-secret IAM bindings |
| Rotation | Full deploy needed | Update secret, restart |
| Audit Trail | Limited | Full Cloud Audit Logs |
| Encryption | AES-256 (default) | AES-256 + Customer Key (optional) |

### Managed Secrets

The following secrets are managed by `scripts/manage-secrets.sh`:

| Secret Name | Env Key | Description |
|-------------|---------|-------------|
| `xtara-web/firebase-api-key` | `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `xtara-web/firebase-auth-domain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `xtara-web/firebase-project-id` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `xtara-web/firebase-storage-bucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `xtara-web/firebase-messaging-sender-id` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `xtara-web/firebase-app-id` | `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `xtara-web/firebase-measurement-id` | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |
| `xtara-web/algolia-app-id` | `NEXT_PUBLIC_ALGOLIA_APP_ID` | Algolia app ID |
| `xtara-web/algolia-search-api-key` | `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` | Algolia search key |
| `xtara-web/nextauth-url` | `NEXTAUTH_URL` | NextAuth base URL |
| `xtara-web/nextauth-secret` | `NEXTAUTH_SECRET` | NextAuth session secret |

## Prerequisites

1. **GCP Project**: `bigmints-xtara`
2. **GCP Region**: `us-central1`
3. **gcloud CLI**: `gcloud --version`
4. **Authentication**: `gcloud auth login` or Application Default Credentials

### Required GCP APIs

```bash
gcloud services enable \
    secretmanager.googleapis.com \
    run.googleapis.com \
    --project bigmints-xtara
```

### Required IAM Roles

The Cloud Run service account (`firebase-adminsdk-fbsvc@bigmints-xtara.iam.gserviceaccount.com`)
needs the **Secret Manager Secret Accessor** role to read secrets at runtime.

```bash
gcloud projects add-iam-policy-binding bigmints-xtara \
    --member="serviceAccount:firebase-adminsdk-fbsvc@bigmints-xtara.iam.gserviceaccount.com" \
    --role="roles/secretmanager.SecretAccessor" \
    --condition=None
```

Or grant per-secret access for tighter control:

```bash
# Grant access to a single secret
gcloud secrets add-iam-policy-binding "xtara-web/firebase-api-key" \
    --member="serviceAccount:firebase-adminsdk-fbsvc@bigmints-xtara.iam.gserviceaccount.com" \
    --role="roles/secretmanager.SecretAccessor" \
    --project bigmints-xtara
```

## Migration Guide

### Step 1: Initialize Secrets

Set your environment variables locally, then run:

```bash
# Set env vars (or source .env.local)
export NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="bigmints-xtara.firebaseapp.com"
# ... set all required vars ...

# Create all secrets in GCP Secret Manager
./scripts/manage-secrets.sh init
```

Or migrate from existing Cloud Run env vars:

```bash
# Auto-detect and migrate current Cloud Run env vars
./set-env.sh --migrate
```

### Step 2: Deploy with Secrets

```bash
# Deploy and mount secrets in one command
./deploy.sh --use-secrets

# Or deploy secrets separately
./scripts/manage-secrets.sh deploy
```

### Step 3: Verify

```bash
# Check sync status between env and GCP
./scripts/manage-secrets.sh status

# List all secrets
./scripts/manage-secrets.sh list

# Verify Cloud Run service has secrets mounted
gcloud run services describe xtara-web \
    --region us-central1 \
    --project bigmints-xtara \
    --format=json | jq '.spec.template.spec.containers[0].env'
```

### Step 4: Rollback to Legacy (if needed)

The legacy `set-env.sh` script still works as a fallback:

```bash
# Revert to env-var-based deployment
./set-env.sh

# Or update Cloud Run manually
gcloud run services update xtara-web \
    --region us-central1 \
    --project bigmints-xtara \
    --update-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=your_key
```

### Step 5: Cleanup (optional)

After confirming Secret Manager works, remove legacy env vars from Cloud Run:

```bash
# Remove env vars from Cloud Run (now sourced from secrets)
gcloud run services update xtara-web \
    --region us-central1 \
    --project bigmints-xtara \
    --clear-env-vars
```

## Rollback Procedure

### Quick Rollback

If a secret value needs to be updated:

```bash
# Update a single secret
./scripts/manage-secrets.sh add firebase-api-key "AIzaSyNEW_KEY_123..."

# Or add a new version (preserves history)
echo "AIzaSyNEW_KEY_123..." | gcloud secrets versions add \
    "xtara-web/firebase-api-key" \
    --project bigmints-xtara \
    --data-file=-
```

### Full Service Rollback

```bash
# Redeploy with a previous image tag (secrets persist)
gcloud run services update xtara-web \
    --image us-docker.pkg.dev/bigmints-xtara/xtara-web-artifacts/xtara-web:<previous-tag> \
    --region us-central1 \
    --project bigmints-xtara
```

### Emergency: Remove All Secrets

```bash
# Warning: This removes secrets from Secret Manager (not the values themselves!)
./scripts/manage-secrets.sh cleanup --dry-run   # Preview
./scripts/manage-secrets.sh cleanup            # Execute
```

## CLI Reference

```bash
# Initialize all secrets from local env vars
./scripts/manage-secrets.sh init

# Add/update a single secret
./scripts/manage-secrets.sh add <name> <value>

# List all managed secrets
./scripts/manage-secrets.sh list

# Deploy (mount) secrets on Cloud Run
./scripts/manage-secrets.sh deploy

# Show sync status
./scripts/manage-secrets.sh status

# Cleanup orphaned secrets
./scripts/manage-secrets.sh cleanup

# Global flags
./scripts/manage-secrets.sh --project my-project --region us-central1 --service xtara-web --dry-run
```

## Troubleshooting

### Secret not found at runtime

```bash
# Verify the secret exists
gcloud secrets describe "xtara-web/firebase-api-key" --project bigmints-xtara

# Check IAM binding
gcloud secrets get-iam-policy "xtara-web/firebase-api-key" --project bigmints-xtara

# Check Cloud Run mount
gcloud run services describe xtara-web --region us-central1 --project bigmints-xtara --format=json | jq '.spec.template.spec.containers[0].env'
```

### Permission denied

```bash
# Grant Secret Accessor role
gcloud secrets add-iam-policy-binding "xtara-web/firebase-api-key" \
    --member="serviceAccount:firebase-adminsdk-fbsvc@bigmints-xtara.iam.gserviceaccount.com" \
    --role="roles/secretmanager.SecretAccessor" \
    --project bigmints-xtara
```

### Dry run to preview changes

```bash
# Preview without executing
./scripts/manage-secrets.sh init --dry-run
./scripts/manage-secrets.sh deploy --dry-run
./scripts/manage-secrets.sh cleanup --dry-run
```

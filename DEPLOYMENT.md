# Cloud Run Deployment Guide

## Overview
This guide explains how to deploy the Xtara Web application to Google Cloud Run.

## Prerequisites

1. **Google Cloud SDK** - Install from [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
2. **Docker** - Install from [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
3. **Service Account Key** - Located at `/credentials/serviceAccountKey_Prod.json`

## Project Configuration

- **Project ID**: `bigmints-xtara`
- **Service Name**: `xtara-web`
- **Region**: `us-central1`
- **Platform**: `managed`

## Quick Deploy

### 1. Simple Deployment

From the `xtara-web` directory, run:

```bash
./deploy.sh
```

This script will:
1. ✅ Verify prerequisites (gcloud, docker, service account)
2. ✅ Authenticate with Google Cloud
3. ✅ Build the Docker image
4. ✅ Push to Google Container Registry (GCR)
5. ✅ Deploy to Cloud Run
6. ✅ Display the service URL

### 2. Manual Deployment

If you prefer to run commands manually:

```bash
# 1. Authenticate
gcloud auth activate-service-account --key-file=../credentials/serviceAccountKey_Prod.json

# 2. Set project
gcloud config set project bigmints-xtara

# 3. Configure Docker
gcloud auth configure-docker

# 4. Build image
docker build -t gcr.io/bigmints-xtara/xtara-web:latest .

# 5. Push image
docker push gcr.io/bigmints-xtara/xtara-web:latest

# 6. Deploy to Cloud Run
gcloud run deploy xtara-web \
  --image gcr.io/bigmints-xtara/xtara-web:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## Environment Variables

### Production Environment Variables

The following environment variables need to be configured in Cloud Run:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bigmints-xtara
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Algolia (if used)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_algolia_search_key

# Next Auth (if used)
NEXTAUTH_URL=https://your-service-url.run.app
NEXTAUTH_SECRET=your_nextauth_secret
```

### Setting Environment Variables

#### Via gcloud CLI:

```bash
gcloud run services update xtara-web \
  --region us-central1 \
  --update-env-vars \
  NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key,\
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain,\
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=bigmints-xtara
```

#### Via Cloud Console:

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Select `xtara-web` service
3. Click "Edit & Deploy New Revision"
4. Go to "Variables & Secrets" tab
5. Add environment variables
6. Click "Deploy"

## Cloud Run Configuration

### Default Settings

- **CPU**: 1 vCPU
- **Memory**: 512 MB
- **Min Instances**: 0 (scales to zero)
- **Max Instances**: 10
- **Timeout**: 60 seconds
- **Port**: 8080
- **Concurrency**: 80 (default)

### Adjusting Resources

To increase memory/CPU for better performance:

```bash
gcloud run services update xtara-web \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2
```

### Custom Domain

To use a custom domain (e.g., app.xtara.ai):

```bash
# Map domain
gcloud run domain-mappings create \
  --service xtara-web \
  --domain app.xtara.ai \
  --region us-central1
```

Then update your DNS with the provided records.

## Monitoring & Logs

### View Logs

```bash
# Real-time logs
gcloud run logs tail xtara-web --region us-central1

# Read recent logs
gcloud run logs read --service xtara-web --region us-central1 --limit 50
```

### View Service Details

```bash
gcloud run services describe xtara-web --region us-central1
```

### Metrics

View metrics in the [Cloud Console](https://console.cloud.google.com/run/detail/us-central1/xtara-web/metrics)

## Troubleshooting

### Build Fails

1. Check Docker is running: `docker ps`
2. Verify `next.config.ts` has `output: 'standalone'`
3. Check build logs for errors

### Deployment Fails

1. Verify service account permissions
2. Check quota limits in GCP
3. Review Cloud Run error logs

### Runtime Errors

1. Check environment variables are set correctly
2. Review application logs: `gcloud run logs read`
3. Verify Firebase credentials

## Rolling Back

To rollback to a previous revision:

```bash
# List revisions
gcloud run revisions list --service xtara-web --region us-central1

# Rollback to specific revision
gcloud run services update-traffic xtara-web \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

## Cost Optimization

Cloud Run charges based on:
- CPU and memory usage (per second)
- Number of requests
- Egress traffic

Tips to reduce costs:
1. Use `--min-instances 0` to scale to zero when idle
2. Optimize image size (multi-stage Docker build)
3. Set appropriate memory limits
4. Enable HTTP/2 and connection pooling

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: bigmints-xtara
      
      - name: Deploy
        run: ./deploy.sh
```

## Support

For issues or questions:
- Check [Cloud Run Documentation](https://cloud.google.com/run/docs)
- Review [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- Contact: help@xtara.ai

# Deployment Knowledge

This document captures deployment context for the xtara-web application.

## Environment

| Variable | Description | Scope |
|----------|-------------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase public API key | Client |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Client |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | GCP project ID (`bigmints-xtara`) | Client/Server |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | Client |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | Client |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web App ID | Client |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics ID | Client |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | Algolia search app ID | Client |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` | Algolia search key | Client |
| `NEXTAUTH_URL` | NextAuth base URL | Server |
| `NEXTAUTH_SECRET` | NextAuth JWT secret | Server |
| `NODE_ENV` | Runtime environment (`production`) | Server |
| `PORT` | HTTP port (`8080`) | Server |

## Deployment Commands

### Quick Deploy
```bash
./deploy.sh
```

### Manual Deploy
```bash
gcloud auth activate-service-account --key-file=../credentials/serviceAccountKey_Prod.json
gcloud config set project bigmints-xtara
gcloud auth configure-docker us-docker.pkg.dev
docker build --platform linux/amd64 -t us-docker.pkg.dev/bigminstxtara/cloud-run-source-deploy/xtara-web:latest .
docker push us-docker.pkg.dev/bigminstxtara/cloud-run-source-deploy/xtara-web:latest
gcloud run deploy xtara-web --image ... --region us-central1
```

## Rollback
```bash
gcloud run revisions list --service xtara-web --region us-central1
gcloud run services update-traffic xtara-web --to-revisions REVISION_NAME=100
```

## Monitoring
```bash
gcloud run logs read --service xtara-web --region us-central1
```

## Service Account
The Cloud Run service uses: `firebase-adminsdk-fbsvc@bigmints-xtara.iam.gserviceaccount.com`

## Artifact Registry
Images are pushed to: `us-docker.pkg.dev/bigminstxtara/cloud-run-source-deploy/xtara-web`

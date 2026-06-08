#!/bin/bash

# Set Production Environment Variables on Cloud Run
# This script configures all necessary environment variables for the production deployment

set -e

PROJECT_ID="bigmints-xtara"
SERVICE_NAME="xtara-web"
REGION="us-central1"

echo "Setting environment variables for $SERVICE_NAME..."

# Read environment variables from .env.local (if needed)
# Or set them directly here

gcloud run services update "$SERVICE_NAME" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --update-env-vars \
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=bigmints-xtara

# Note: Add other environment variables as needed:
# NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key,\
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain,\
# etc.

echo "✓ Environment variables updated successfully"
echo ""
echo "To view current environment variables:"
echo "gcloud run services describe $SERVICE_NAME --region $REGION --format='value(spec.template.spec.containers[0].env)'"

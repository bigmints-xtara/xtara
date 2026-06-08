#!/bin/bash

# Xtara Web - Cloud Run Deployment Script
# This script builds and deploys the Next.js application to Google Cloud Run

set -e  # Exit on error

# ===========================
# Configuration
# ===========================
PROJECT_ID="bigmints-xtara"
SERVICE_NAME="xtara-web"
REGION="us-central1"
SERVICE_ACCOUNT_KEY="../credentials/serviceAccountKey_Prod.json"
# Use Artifact Registry instead of GCR
IMAGE_NAME="us-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/${SERVICE_NAME}"
PLATFORM="managed"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===========================
# Functions
# ===========================

print_header() {
    echo -e "${BLUE}===================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# ===========================
# Pre-flight Checks
# ===========================

print_header "Pre-flight Checks"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi
print_success "gcloud CLI is installed"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install it first:"
    echo "https://docs.docker.com/get-docker/"
    exit 1
fi
print_success "Docker is installed"

# Check if service account key exists
if [ ! -f "$SERVICE_ACCOUNT_KEY" ]; then
    print_error "Service account key not found at: $SERVICE_ACCOUNT_KEY"
    exit 1
fi
print_success "Service account key found"

# ===========================
# Authenticate with Google Cloud
# ===========================

print_header "Authenticating with Google Cloud"

# Activate service account
gcloud auth activate-service-account --key-file="$SERVICE_ACCOUNT_KEY"
print_success "Service account activated"

# Set project
gcloud config set project "$PROJECT_ID"
print_success "Project set to: $PROJECT_ID"

# Configure Docker to use gcloud  as credential helper for Artifact Registry
gcloud auth configure-docker us-docker.pkg.dev --quiet
print_success "Docker configured for Artifact Registry"

# ===========================
# Build Docker Image
# ===========================

print_header "Building Docker Image"

print_info "Building image: $IMAGE_NAME"

# Build the Docker image
docker build --platform linux/amd64 -t "$IMAGE_NAME:latest" -t "$IMAGE_NAME:$(date +%Y%m%d-%H%M%S)" .

print_success "Docker image built successfully"

# ===========================
# Push Docker Image
# ===========================

print_header "Pushing Docker Image to Artifact Registry"

print_info "Pushing image: $IMAGE_NAME:latest"

# Push the latest tag
docker push "$IMAGE_NAME:latest"

print_success "Docker image pushed to Artifact Registry"

# ===========================
# Deploy to Cloud Run
# ===========================

print_header "Deploying to Cloud Run"

print_info "Deploying service: $SERVICE_NAME"
print_info "Region: $REGION"

# Deploy to Cloud Run
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME:latest" \
  --platform "$PLATFORM" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60s \
  --service-account "firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project "$PROJECT_ID"

print_success "Deployment completed!"

# ===========================
# Get Service URL
# ===========================

print_header "Deployment Information"

# Get the service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --platform "$PLATFORM" \
  --region "$REGION" \
  --format 'value(status.url)' \
  --project "$PROJECT_ID")

echo ""
print_success "Service deployed successfully!"
echo ""
echo -e "${GREEN}Service URL:${NC} ${BLUE}$SERVICE_URL${NC}"
echo -e "${GREEN}Region:${NC} $REGION"
echo -e "${GREEN}Service Name:${NC} $SERVICE_NAME"
echo -e "${GREEN}Project:${NC} $PROJECT_ID"
echo ""

print_info "You can view logs with:"
echo "  gcloud run logs read --service=$SERVICE_NAME --region=$REGION"
echo ""

print_header "Deployment Complete! 🎉"

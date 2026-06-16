#!/bin/bash

# =============================================================================
# Xtara Web - Cloud Run Deployment Script
# =============================================================================
# This script builds and deploys the Next.js application to Google Cloud Run.
#
# Usage:
#   ./deploy.sh                  # Auto-compute version and deploy
#   ./deploy.sh v1.2.3          # Deploy with explicit version tag
#   ./deploy.sh --version       # Show computed version without deploying
#   ./deploy.sh --dry-run       # Print all commands without executing
#   ./deploy.sh v1.2.3 --dry-run
#
# Authentication:
#   Uses Application Default Credentials (ADC). Configure via:
#     Local:  gcloud auth application-default login
#     CI/CD:   Workload Identity Federation (preferred)
#              or set GOOGLE_APPLICATION_CREDENTIALS env var
#
# Prerequisites:
#   gcloud CLI, Docker (with Buildx), git
#
# =============================================================================

set -euo pipefail

# ===========================
# Configuration
# ===========================
PROJECT_ID="bigmints-xtara"
SERVICE_NAME="xtara-web"
REGION="us-central1"
PLATFORM="managed"
# Dedicated Artifact Registry repository (not the default cloud-run-source-deploy)
ARTIFACT_REPO="us-docker.pkg.dev/${PROJECT_ID}/xtara-web-artifacts"
IMAGE_NAME="${ARTIFACT_REPO}/${SERVICE_NAME}"

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

# Compute version tag from git commit short hash + timestamp.
# The git hash gives deterministic, reproducible builds; the timestamp avoids
# collisions during rapid local deploys.
compute_version() {
    local git_hash timestamp
    git_hash=$(git rev-parse --short HEAD 2>/dev/null) || git_hash="unknown"
    timestamp=$(date +%Y%m%d-%H%M%S)
    echo "${git_hash}-${timestamp}"
}

# ===========================
# Parse Arguments
# ===========================

VERSION_TAG=""
DRY_RUN="false"
SHOW_VERSION_ONLY="false"
USE_SECRETS="false"

for arg in "$@"; do
    case "$arg" in
        --dry-run)
            DRY_RUN="true"
            ;;
        --version)
            SHOW_VERSION_ONLY="true"
            ;;
        --use-secrets)
            USE_SECRETS="true"
            ;;
        --)
            # Stop processing flags
            ;;
        -*)
            print_error "Unknown option: $arg"
            echo "Usage: ./deploy.sh [version_tag] [--dry-run] [--version] [--use-secrets]"
            exit 1
            ;;
        *)
            # Positional argument - treat as explicit version tag
            if [[ -n "$VERSION_TAG" ]]; then
                print_error "Multiple version tags provided: $VERSION_TAG and $arg"
                exit 1
            fi
            VERSION_TAG="$arg"
            ;;
    esac
done

# Auto-compute version if not explicitly provided
if [[ -z "$VERSION_TAG" ]]; then
    VERSION_TAG=$(compute_version)
fi

# Handle --version: just print the tag and exit
if [[ "$SHOW_VERSION_ONLY" == "true" ]]; then
    echo "$VERSION_TAG"
    exit 0
fi

# ===========================
# PREREQUISITES
# ===========================

print_header "Pre-flight Checks"

# Check if gcloud is installed.
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi
print_success "gcloud CLI is installed"

# Check if Docker is installed.
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install it first:"
    echo "https://docs.docker.com/get-docker/"
    exit 1
fi
print_success "Docker is installed"

# Check if docker buildx is available (BuildKit is needed for multi-platform builds).
if ! docker buildx version &> /dev/null; then
    print_error "Docker Buildx is not available. Enable it with:"
    echo "  docker buildx create --name builder --driver docker-container --bootstrap"
    exit 1
fi
print_success "Docker Buildx is available"

# Check if git is installed (needed for version tagging).
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install it first:"
    echo "https://git-scm.com/"
    exit 1
fi
print_success "Git is installed"

# ===========================
# AUTHENTICATION
# ===========================
# Use Application Default Credentials (ADC) instead of a hardcoded service account
# key file. This avoids committing a JSON key or hardcoding paths and works
# seamlessly with Workload Identity Federation in CI/CD pipelines.
#
# Setup options:
#   Local development:
#     gcloud auth application-default login
#   CI/CD (set the env var):
#     export GOOGLE_APPLICATION_CREDENTIALS=<path-to-key>
#   Workload Identity Federation (recommended for CI/CD pipelines):
#     gcloud auth application-default set-credentials

print_header "Authenticating with Google Cloud"

# Verify that ADC is configured. This check catches missing credentials early
# so the build does not start before failing on auth.
if gcloud auth application-default print-access-token &> /dev/null; then
    print_success "Application Default Credentials (ADC) are configured"
    print_info "Using Workload Identity Federation (preferred for CI/CD) or local ADC"
else
    print_error "Application Default Credentials (ADC) not configured."
    echo ""
    echo "Please configure ADC using one of the following methods:"
    echo ""
    echo "  Local development:"
    echo "    gcloud auth application-default login"
    echo ""
    echo "  CI/CD (set the env var):"
    echo "    export GOOGLE_APPLICATION_CREDENTIALS=<path-to-key>"
    echo ""
    echo "  Workload Identity Federation (recommended for CI/CD pipelines):"
    echo "    gcloud auth application-default set-credentials"
    echo ""
    exit 1
fi

# Set project
if [[ "$DRY_RUN" != "true" ]]; then
    gcloud config set project "$PROJECT_ID"
fi
print_success "Project set to: $PROJECT_ID"

# Configure Docker to use gcloud as credential helper for Artifact Registry.
# This enables docker push and docker buildx build --push to authenticate
# automatically against us-docker.pkg.dev.
if [[ "$DRY_RUN" != "true" ]]; then
    gcloud auth configure-docker us-docker.pkg.dev --quiet
fi
print_success "Docker configured for Artifact Registry"

# ===========================
# BUILD
# ===========================

print_header "Building Docker Image"

# Default platforms for multi-architecture builds.
# Users can override this to a single platform (e.g., linux/arm64) to avoid
# slow QEMU emulation during local development.
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"

print_info "Building image: $IMAGE_NAME:$VERSION_TAG"
print_info "Platforms: $PLATFORMS"
print_info "Using Docker Buildx with BuildKit cache"

# Build using docker buildx for multi-platform support with BuildKit cache.
# --push pushes directly to the registry during the build (avoids a separate
# docker push step). --provenance=maximum stores build metadata for traceability.
# --cache-from/to enables distributed BuildKit cache (useful for CI/CD).
if [[ "$DRY_RUN" == "true" ]]; then
    print_info "[DRY-RUN] docker buildx build --platform $PLATFORMS \\"
    print_info "  --provenance=maximum \\"
    print_info "  --cache-from=type=registry,ref=$IMAGE_NAME:cache \\"
    print_info "  --cache-to=type=registry,ref=$IMAGE_NAME:cache,mode=max \\"
    print_info "  --push \\"
    print_info "  -t $IMAGE_NAME:$VERSION_TAG \\"
    print_info "  -t $IMAGE_NAME:latest \\"
    print_info "  ."
else
    docker buildx build \
        --platform "$PLATFORMS" \
        --provenance=maximum \
        --cache-from=type=registry,ref=${IMAGE_NAME}:cache \
        --cache-to=type=registry,ref=${IMAGE_NAME}:cache,mode=max \
        --push \
        -t "${IMAGE_NAME}:${VERSION_TAG}" \
        -t "${IMAGE_NAME}:latest" \
        .
fi
print_success "Docker image built and pushed to Artifact Registry"

# ===========================
# PUSH
# ===========================
# The --push flag in the build step already pushed both tags (versioned + latest).
# This section explicitly documents the pushed tags for clarity.
# Tags:
#   <version> - deterministic, versioned tag for rollbacks (e.g., a1b2c3d-20260609-143000)
#   latest    - convenience tag for quick rollback

print_header "Artifact Registry"

print_info "Image tags pushed:"
print_info "  $IMAGE_NAME:$VERSION_TAG"
print_info "  $IMAGE_NAME:latest"
print_success "Images pushed to Artifact Registry"

# Build --update-secrets flags for Cloud Run deployment.
# Called when --use-secrets is passed to deploy.sh
build_secret_flags() {
    local prefix="xtara-web"
    local secret_map=(
        "NEXT_PUBLIC_FIREBASE_API_KEY=${prefix}/firebase-api-key"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${prefix}/firebase-auth-domain"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID=${prefix}/firebase-project-id"
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${prefix}/firebase-storage-bucket"
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${prefix}/firebase-messaging-sender-id"
        "NEXT_PUBLIC_FIREBASE_APP_ID=${prefix}/firebase-app-id"
        "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${prefix}/firebase-measurement-id"
        "NEXT_PUBLIC_ALGOLIA_APP_ID=${prefix}/algolia-app-id"
        "NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=${prefix}/algolia-search-api-key"
        "NEXTAUTH_URL=${prefix}/nextauth-url"
        "NEXTAUTH_SECRET=${prefix}/nextauth-secret"
    )

    local flags=""

    for entry in "${secret_map[@]}"; do
        local env_key="${entry%%=*}"
        local secret_name="${entry#*=}"

        if gcloud secrets describe "$secret_name" --project "$PROJECT_ID" --format=json > /dev/null 2>&1; then
            local secret_ref="projects/${PROJECT_ID}/secrets/${secret_name}/versions/latest"
            if [[ -n "$flags" ]]; then
                flags="$flags ${env_key}=${secret_ref}"
            else
                flags="${env_key}=${secret_ref}"
            fi
        fi
    done

    echo "$flags"
}

# =============================================================================
# First-time Artifact Registry setup (if the repo does not exist yet):
#
#   gcloud artifacts repositories create xtara-web-artifacts \
#     --repository-name=xtara-web-artifacts \
#     --project=$PROJECT_ID \
#     --location=us-central1 \
#     --repository-format="Docker"
#
# Or use --create-repo when deploying via gcloud run deploy:
#   gcloud run deploy ... --create-repo ...
# =============================================================================

# ===========================
# SECRETS (optional)
# ===========================

SECRET_DEPLOY_FLAGS=""
if [[ "$USE_SECRETS" == "true" ]]; then
    print_info "Mounting secrets from GCP Secret Manager..."
    SECRET_DEPLOY_FLAGS=$(build_secret_flags)
    if [[ -n "$SECRET_DEPLOY_FLAGS" ]]; then
        secret_count=$(echo "$SECRET_DEPLOY_FLAGS" | grep -o "projects/" | wc -l)
        print_info "Will mount ${secret_count} secrets from Secret Manager"
    else
        print_warning "No secrets found in Secret Manager. Run './scripts/manage-secrets.sh init' first."
    fi
fi

# ===========================
# DEPLOY
# ===========================

print_header "Deploying to Cloud Run"

print_info "Deploying service: $SERVICE_NAME"
print_info "Image: $IMAGE_NAME:$VERSION_TAG"
print_info "Region: $REGION"

# Deploy to Cloud Run with the versioned image.
# Using the versioned tag (not :latest) ensures a deterministic rollback point.
if [[ "$DRY_RUN" == "true" ]]; then
    print_info "[DRY-RUN] gcloud run deploy $SERVICE_NAME \\"
    print_info "  --image $IMAGE_NAME:$VERSION_TAG \\"
    print_info "  --platform $PLATFORM \\"
    print_info "  --region $REGION \\"
    print_info "  --allow-unauthenticated \\"
    print_info "  --port 8080 \\"
    print_info "  --memory 512Mi \\"
    print_info "  --cpu 1 \\"
    print_info "  --min-instances 0 \\"
    print_info "  --max-instances 10 \\"
    print_info "  --timeout 60s \\"
    print_info "  --service-account firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com \\"
    if [[ "$USE_SECRETS" == "true" && -n "$SECRET_DEPLOY_FLAGS" ]]; then
        print_info "  --update-secrets $(echo $SECRET_DEPLOY_FLAGS | xargs | sed 's/ /\\ /g') \\"
    fi
    print_info "  --project $PROJECT_ID"
else
    if [[ "$USE_SECRETS" == "true" && -n "$SECRET_DEPLOY_FLAGS" ]]; then
        gcloud run deploy "$SERVICE_NAME" \
            --image "${IMAGE_NAME}:${VERSION_TAG}" \
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
            --update-secrets $SECRET_DEPLOY_FLAGS \
            --project "$PROJECT_ID"
    else
        gcloud run deploy "$SERVICE_NAME" \
            --image "${IMAGE_NAME}:${VERSION_TAG}" \
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
    fi
fi

print_success "Deployment completed!"

# ===========================
# Deployment Information
# ===========================

print_header "Deployment Information"

# Retrieve the service URL.
if [[ "$DRY_RUN" == "true" ]]; then
    print_info "[DRY-RUN] Would retrieve service URL from: gcloud run services describe"
else
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
        --platform "$PLATFORM" \
        --region "$REGION" \
        --format 'value(status.url)' \
        --project "$PROJECT_ID")
fi

echo ""
print_success "Service deployed successfully!"
echo ""
echo -e "${GREEN}Version tag:${NC} $VERSION_TAG"
echo -e "${GREEN}Image:${NC} ${BLUE}$IMAGE_NAME:$VERSION_TAG${NC}"
echo -e "${GREEN}Region:${NC} $REGION"
echo -e "${GREEN}Service Name:${NC} $SERVICE_NAME"
echo -e "${GREEN}Project:${NC} $PROJECT_ID"
echo ""

print_info "You can view logs with:"
echo "  gcloud run logs read --service=$SERVICE_NAME --region=$REGION"
echo ""
print_info "To rollback, redeploy with a previous version tag:"
echo "  gcloud run services update $SERVICE_NAME \\"
echo "    --image $IMAGE_NAME:<previous-tag> \\"
echo "    --region $REGION --project $PROJECT_ID"
echo ""
print_info "To list all available versions in Artifact Registry:"
echo "  gcloud artifacts versions list --repository=xtara-web-artifacts --project=$PROJECT_ID"
echo ""
print_header "Deployment Complete!"

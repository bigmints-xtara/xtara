#!/bin/bash
# =============================================================================
# DEPRECATION NOTICE
# =============================================================================
# set-env.sh is DEPRECATED in favor of Google Cloud Secret Manager.
#
# New source of truth: scripts/manage-secrets.sh
#
# Migration guide:
#   1. Copy your current env vars to a .env.local file
#   2. Run: ./scripts/manage-secrets.sh init
#   3. Run: ./scripts/manage-secrets.sh deploy
#   4. Verify: ./scripts/manage-secrets.sh status
#   5. Rollback: this script still works as a fallback
#
# See: SECRETS.md for full details
# =============================================================================
#
# Xtara Web — Set Production Environment Variables on Cloud Run
# (Deprecated — kept as fallback for existing deployments)
#
# Usage:
#   ./set-env.sh                  # Set default env vars on Cloud Run
#   ./set-env.sh --migrate        # Migrate current Cloud Run env vars to Secret Manager
#
# =============================================================================

set -e

PROJECT_ID="bigmints-xtara"
SERVICE_NAME="xtara-web"
REGION="us-central1"

# ===========================
# Helper Functions
# ===========================

print_header() {
    echo "========================================="
    echo "$1"
    echo "========================================="
}

print_success() {
    echo "✓ $1"
}

print_error() {
    echo "✗ $1"
}

print_warning() {
    echo "⚠ $1"
}

print_info() {
    echo "ℹ $1"
}

# ===========================
# Migration Function
# ===========================

migrate_to_secrets() {
    print_header "Migrate Cloud Run Env Vars to Secret Manager"
    print_info "Reading current environment variables from Cloud Run service..."
    print_info "Project: $PROJECT_ID | Service: $SERVICE_NAME | Region: $REGION"
    echo ""

    # Fetch all current environment variables from Cloud Run
    local env_vars
    env_vars=$(gcloud run services describe "$SERVICE_NAME" \
        --platform managed \
        --region "$REGION" \
        --project "$PROJECT_ID" \
        --format=json 2>/dev/null) || true

    # Extract env vars from the JSON output
    local env_keys
    env_keys=$(echo "$env_vars" | jq -r '.spec.template.spec.containers[0].env[].name' 2>/dev/null) || true

    local env_values
    env_values=$(echo "$env_vars" | jq -r '.spec.template.spec.containers[0].env[] | "\(.name)=\(.value)"' 2>/dev/null) || true

    if [[ -z "$env_keys" ]]; then
        print_info "No environment variables found on the Cloud Run service."
    else
        print_info "Found the following environment variables:"
        echo ""

        # Migrate each env var to Secret Manager
        while IFS= read -r line; do
            local key="${line%%=*}"
            local value="${line#*=}"
            local secret_name="xtara-web/${key,,}"

            # Convert env key to secret name (lowercase, replace _ with -)
            local secret_safe="${key//_/-}"
            secret_name="xtara-web/${secret_safe,,}"

            print_info "Migrating: $key → $secret_name"

            # Use manage-secrets.sh to create the secret
            if [[ -x "$(dirname "$0")/scripts/manage-secrets.sh" ]]; then
                "$(dirname "$0")/scripts/manage-secrets.sh" add "$secret_safe" "$value"
            else
                # Fallback: use gcloud directly
                echo "$value" | gcloud secrets create "$secret_name" \
                    --project "$PROJECT_ID" \
                    --data-file=- \
                    --replication="user-managed" \
                    --replication-location="$REGION" \
                    --quiet 2>/dev/null || \
                    echo "$value" | gcloud secrets versions add "$secret_name" \
                    --project "$PROJECT_ID" \
                    --data-file=- 2>/dev/null

                print_success "Created/updated secret: $secret_name"
            fi
        done <<< "$env_values"

        echo ""
        print_success "Migration complete!"
        echo ""
        print_info "Next steps:"
        print_info "  1. Review secrets: ./scripts/manage-secrets.sh list"
        print_info "  2. Deploy secrets: ./scripts/manage-secrets.sh deploy"
        print_info "  3. Verify status:  ./scripts/manage-secrets.sh status"
    fi
}

# ===========================
# Check for --migrate flag
# ===========================

if [[ "${1:-}" == "--migrate" ]]; then
    print_warning "Deprecation: set-env.sh is being replaced by scripts/manage-secrets.sh"
    migrate_to_secrets
    exit 0
fi

# ===========================
# Legacy Behavior (fallback)
# ===========================

echo "⚠ DEPRECATED: set-env.sh is being replaced by scripts/manage-secrets.sh"
echo "⚠ Use --migrate to migrate existing env vars, or switch to manage-secrets.sh"
echo ""
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

echo ""
echo "✓ Environment variables updated successfully"
echo ""
echo "To view current environment variables:"
echo "gcloud run services describe $SERVICE_NAME --region $REGION --format='value(spec.template.spec.containers[0].env)'"

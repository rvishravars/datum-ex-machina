#!/bin/bash

# Datum Ex Machina - Single-Service Cloud Run Deployment Script
# This script builds a single container (Frontend + Backend) and deploys it.

set -e

# Configuration
PROJECT_NAME="datum-ex-machina"
REGION="us-central1"
REPO_NAME="datum-registry"
APP_SERVICE="datum-app"

echo "🚀 Starting UNIFIED deployment of $PROJECT_NAME to Google Cloud Run..."

# 1. Check for gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed."
    exit 1
fi

# 2. Get Project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
    echo "❌ Error: No default project set."
    exit 1
fi

echo "✅ Using Project: $PROJECT_ID"
echo "✅ Region: $REGION"

# 3. Enable necessary APIs (only if needed to save time)
echo "📡 Checking Google Cloud APIs..."
SERVICES=("run.googleapis.com" "artifactregistry.googleapis.com" "cloudbuild.googleapis.com")
for SERVICE in "${SERVICES[@]}"; do
    if ! gcloud services list --enabled --filter="config.name=$SERVICE" --format="value(config.name)" | grep -q "$SERVICE"; then
        echo "  -> Enabling $SERVICE..."
        gcloud services enable "$SERVICE" --quiet
    fi
done

# 4. Create Artifact Registry if it doesn't exist
echo "📦 Ensuring Artifact Registry exists..."
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" &> /dev/null; then
    echo "  -> Creating repository $REPO_NAME..."
    gcloud artifacts repositories create "$REPO_NAME" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker repository for $PROJECT_NAME" \
        --quiet
fi

# 5. Build and Deploy UNIFIED APP
echo "🛠️ Building and Deploying Unified App Container..."
APP_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$APP_SERVICE:latest"

# Build from root using the unified Dockerfile
gcloud builds submit . --tag "$APP_TAG"

gcloud run deploy "$APP_SERVICE" \
    --image "$APP_TAG" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --port 8080 \
    --set-env-vars "ENV=production" \
    --quiet

# Final URL
APP_URL=$(gcloud run services describe "$APP_SERVICE" --platform managed --region "$REGION" --format 'value(status.url)')

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Your app is fully live at: $APP_URL"
echo ""
echo "💡 Note: This is now a single-container deployment (FastAPI serving React)."

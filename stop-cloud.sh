#!/bin/bash

# Datum Ex Machina - GCP Cloud Run Cleanup Script
# This script deletes the active Cloud Run services to ensure zero compute costs.

set -e

# Configuration
REGION="us-central1"
BACKEND_SERVICE="datum-backend"
FRONTEND_SERVICE="datum-frontend"
REPO_NAME="datum-registry"

echo "🛑 Starting cleanup of $BACKEND_SERVICE and $FRONTEND_SERVICE..."

# 1. Delete Frontend Service
echo "🗑️ Deleting Frontend Service..."
if gcloud run services describe "$FRONTEND_SERVICE" --platform managed --region "$REGION" &> /dev/null; then
    gcloud run services delete "$FRONTEND_SERVICE" --platform managed --region "$REGION" --quiet
    echo "✅ Frontend service deleted."
else
    echo "ℹ️ Frontend service not found or already deleted."
fi

# 2. Delete Backend Service
echo "🗑️ Deleting Backend Service..."
if gcloud run services describe "$BACKEND_SERVICE" --platform managed --region "$REGION" &> /dev/null; then
    gcloud run services delete "$BACKEND_SERVICE" --platform managed --region "$REGION" --quiet
    echo "✅ Backend service deleted."
else
    echo "ℹ️ Backend service not found or already deleted."
fi

echo ""
echo "💰 Cloud Run compute costs have been stopped (scaled to absolute zero)."
echo ""
echo "❓ Do you also want to delete the Artifact Registry images to save on storage costs? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🗑️ Deleting Artifact Registry repository: $REPO_NAME..."
    gcloud artifacts repositories delete "$REPO_NAME" --location="$REGION" --quiet
    echo "✅ Artifact Registry deleted."
else
    echo "ℹ️ Keeping images in Artifact Registry for faster redeployment later."
fi

echo ""
echo "🎉 Cleanup complete!"

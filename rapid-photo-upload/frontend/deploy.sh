#!/bin/bash

set -e  # Exit on error

# Configuration - Set these environment variables or modify defaults
S3_BUCKET="${S3_BUCKET:-teamfront-rapid-photo-upload-frontend}"
CLOUDFRONT_DISTRIBUTION_COMMENT="rapid-photo-upload Frontend"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi

echo "Building rapid-photo-upload frontend for web..."

# Set production environment variables for the build
export EXPO_PUBLIC_ENV="production"
export EXPO_PUBLIC_API_URL="https://api.teamfront-rapid-photo-upload.archlife.org/api/v1"
export EXPO_PUBLIC_WS_URL="https://api.teamfront-rapid-photo-upload.archlife.org"

yarn install
yarn build:web

if [ ! -d "./dist" ]; then
    echo "Error: Build failed - dist directory not found"
    exit 1
fi

echo "Syncing dist/ to S3 bucket: ${S3_BUCKET}..."
aws s3 sync ./dist s3://${S3_BUCKET} --delete --cache-control "public, max-age=31536000, immutable"

# Set proper content types for common file types
echo "Setting content types for HTML files..."
aws s3 cp s3://${S3_BUCKET}/index.html s3://${S3_BUCKET}/index.html --content-type "text/html" --cache-control "public, max-age=0, must-revalidate"
aws s3 cp s3://${S3_BUCKET}/404.html s3://${S3_BUCKET}/404.html --content-type "text/html" --cache-control "public, max-age=0, must-revalidate" 2>/dev/null || true

# Get CloudFront distribution ID by comment
DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='${CLOUDFRONT_DISTRIBUTION_COMMENT}'].Id" \
    --output text 2>/dev/null | head -1)

# Invalidate CloudFront cache if distribution exists
if [ -n "$DIST_ID" ] && [ "$DIST_ID" != "None" ] && [ "$DIST_ID" != "" ]; then
    echo "Invalidating CloudFront distribution: ${DIST_ID}..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id ${DIST_ID} \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text 2>/dev/null)
    
    if [ -n "$INVALIDATION_ID" ] && [ "$INVALIDATION_ID" != "None" ]; then
        echo "✓ CloudFront invalidation created: ${INVALIDATION_ID}"
        echo "  Note: Invalidation may take a few minutes to complete."
    else
        echo "⚠ Warning: Failed to create CloudFront invalidation"
    fi
else
    echo "⚠ Warning: No CloudFront distribution found for '${CLOUDFRONT_DISTRIBUTION_COMMENT}'"
    echo "  Skipping CloudFront invalidation."
fi

echo "✓ Deployment complete!"
echo "S3 Bucket: ${S3_BUCKET}"
if [ -n "$DIST_ID" ] && [ "$DIST_ID" != "None" ] && [ "$DIST_ID" != "" ]; then
    echo "CloudFront Distribution: ${DIST_ID}"
fi


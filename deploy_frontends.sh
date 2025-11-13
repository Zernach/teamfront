#!/bin/bash
# Don't exit on error - we want to deploy all projects even if one fails
set +e

ensure_cloudfront_spa_support() {
  local project="$1"
  local dist_id="$2"

  if [ -z "$dist_id" ] || [ "$dist_id" = "None" ]; then
    return
  fi

  local tmp_config tmp_body etag spa_status
  tmp_config=$(mktemp)
  tmp_body=$(mktemp)

  if ! aws cloudfront get-distribution-config --id "$dist_id" > "$tmp_config" 2>/dev/null; then
    echo "⚠ Warning: Unable to fetch CloudFront config for ${project} (${dist_id})"
    rm -f "$tmp_config" "$tmp_body"
    return
  fi

  etag=$(jq -r '.ETag' "$tmp_config")
  if [ -z "$etag" ] || [ "$etag" = "null" ]; then
    echo "⚠ Warning: Missing ETag for CloudFront distribution ${dist_id}"
    rm -f "$tmp_config" "$tmp_body"
    return
  fi

  jq '.DistributionConfig' "$tmp_config" > "$tmp_body"

  spa_status=$(python3 - "$tmp_body" <<'PY'
import json
import sys

path = sys.argv[1]
with open(path) as fp:
    config = json.load(fp)

changed = False

if config.get("DefaultRootObject") != "index.html":
    config["DefaultRootObject"] = "index.html"
    changed = True

custom = config.get("CustomErrorResponses")
if not custom:
    custom = {"Quantity": 0, "Items": []}
    config["CustomErrorResponses"] = custom

items = custom.get("Items") or []
desired = {
    "ResponsePagePath": "/index.html",
    "ResponseCode": "200",
    "ErrorCachingMinTTL": 0,
}

for error_code in (403, 404):
    existing = next((item for item in items if item.get("ErrorCode") == error_code), None)
    if existing:
        for key, value in desired.items():
            if existing.get(key) != value:
                existing[key] = value
                changed = True
    else:
        new_item = {"ErrorCode": error_code}
        new_item.update(desired)
        items.append(new_item)
        changed = True

if custom.get("Quantity") != len(items):
    custom["Quantity"] = len(items)
    changed = True

custom["Items"] = items

if changed:
    with open(path, "w") as fp:
        json.dump(config, fp, indent=2)
    print("updated")
else:
    print("noop")
PY
)

  spa_status=$(echo "$spa_status" | tr -d '\n\r ')
  if [ "$spa_status" = "updated" ]; then
    if aws cloudfront update-distribution \
      --id "$dist_id" \
      --if-match "$etag" \
      --distribution-config file://"$tmp_body" >/dev/null 2>&1; then
      echo "✓ Enabled SPA routing fallback for CloudFront distribution ${dist_id}"
    else
      echo "⚠ Warning: Failed to update CloudFront distribution ${dist_id}"
    fi
  else
    echo "✓ CloudFront distribution ${dist_id} already supports SPA routing"
  fi

  rm -f "$tmp_config" "$tmp_body"
}

PROJECTS=(
  "smart-scheduler"
  "invoice-me"
  "rapid-photo-upload"
)

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

echo "Building and deploying all frontends..."
echo ""

FAILED_PROJECTS=()
SUCCESSFUL_PROJECTS=()

for PROJECT in "${PROJECTS[@]}"; do
  BUCKET="teamfront-${PROJECT}-frontend"
  FRONTEND_DIR="${PROJECT}/frontend"
  
  echo "=========================================="
  echo "=== ${PROJECT} ==="
  echo "=========================================="
  
  # Check if frontend directory exists
  if [ ! -d "$FRONTEND_DIR" ]; then
    echo "Error: Frontend directory ${FRONTEND_DIR} does not exist!"
    FAILED_PROJECTS+=("${PROJECT}")
    echo ""
    continue
  fi
  
  # Change to frontend directory
  cd "$FRONTEND_DIR" || {
    echo "Error: Failed to change to ${FRONTEND_DIR}"
    FAILED_PROJECTS+=("${PROJECT}")
    echo ""
    continue
  }
  
  # Build the frontend
  echo "Building ${PROJECT} frontend for web..."
  yarn install
  if [ $? -ne 0 ]; then
    echo "Error: yarn install failed for ${PROJECT}"
    FAILED_PROJECTS+=("${PROJECT}")
    cd - > /dev/null
    echo ""
    continue
  fi
  
  yarn build:web
  if [ $? -ne 0 ]; then
    echo "Error: Build failed for ${PROJECT}"
    FAILED_PROJECTS+=("${PROJECT}")
    cd - > /dev/null
    echo ""
    continue
  fi
  
  # Check if dist directory exists
  if [ ! -d "./dist" ]; then
    echo "Error: Build failed - dist directory not found for ${PROJECT}"
    FAILED_PROJECTS+=("${PROJECT}")
    cd - > /dev/null
    echo ""
    continue
  fi
  
  # Deploy to S3
  echo "Syncing dist/ to S3 bucket: ${BUCKET}..."
  aws s3 sync ./dist s3://${BUCKET} --delete --cache-control "public, max-age=31536000, immutable"
  if [ $? -ne 0 ]; then
    echo "Error: S3 sync failed for ${PROJECT}"
    FAILED_PROJECTS+=("${PROJECT}")
    cd - > /dev/null
    echo ""
    continue
  fi
  
  # Set proper content types for HTML files
  echo "Setting content types for HTML files..."
  aws s3 cp s3://${BUCKET}/index.html s3://${BUCKET}/index.html \
    --content-type "text/html" \
    --cache-control "public, max-age=0, must-revalidate" \
    2>/dev/null || true
  
  aws s3 cp s3://${BUCKET}/404.html s3://${BUCKET}/404.html \
    --content-type "text/html" \
    --cache-control "public, max-age=0, must-revalidate" \
    2>/dev/null || true
  
  # Get CloudFront distribution ID by comment
  DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='${PROJECT} Frontend'].Id" \
    --output text 2>/dev/null | head -1)
  
  # Ensure CloudFront delivers SPA routes and invalidate cache if distribution exists
  if [ -n "$DIST_ID" ] && [ "$DIST_ID" != "None" ] && [ "$DIST_ID" != "" ]; then
    ensure_cloudfront_spa_support "$PROJECT" "$DIST_ID"
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
    echo "⚠ Warning: No CloudFront distribution found for ${PROJECT}"
    echo "  Skipping CloudFront invalidation."
  fi
  
  echo "✓ Deployment complete for ${PROJECT}!"
  SUCCESSFUL_PROJECTS+=("${PROJECT}")
  
  # Return to root directory
  cd - > /dev/null
  echo ""
done

# Summary
echo "=========================================="
echo "=== Deployment Summary ==="
echo "=========================================="

if [ ${#SUCCESSFUL_PROJECTS[@]} -gt 0 ]; then
  echo ""
  echo "✓ Successfully deployed:"
  for PROJECT in "${SUCCESSFUL_PROJECTS[@]}"; do
    BUCKET="teamfront-${PROJECT}-frontend"
    DIST_ID=$(aws cloudfront list-distributions \
      --query "DistributionList.Items[?Comment=='${PROJECT} Frontend'].Id" \
      --output text 2>/dev/null | head -1)
    
    echo ""
    echo "  ${PROJECT}:"
    echo "    S3 Bucket: ${BUCKET}"
    echo "    S3 Website: https://${BUCKET}.s3-website-us-west-1.amazonaws.com/"
    
    if [ -n "$DIST_ID" ] && [ "$DIST_ID" != "None" ] && [ "$DIST_ID" != "" ]; then
      DIST_DOMAIN=$(aws cloudfront get-distribution \
        --id ${DIST_ID} \
        --query 'Distribution.DomainName' \
        --output text 2>/dev/null || echo "")
      if [ -n "$DIST_DOMAIN" ] && [ "$DIST_DOMAIN" != "None" ]; then
        echo "    CloudFront: https://${DIST_DOMAIN}"
      fi
    fi
  done
fi

if [ ${#FAILED_PROJECTS[@]} -gt 0 ]; then
  echo ""
  echo "✗ Failed deployments:"
  for PROJECT in "${FAILED_PROJECTS[@]}"; do
    echo "  - ${PROJECT}"
  done
  echo ""
  exit 1
fi

echo ""
echo "All deployments completed successfully!"
exit 0

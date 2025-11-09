#!/bin/bash
set -e

PROJECTS=(
  "smart-scheduler"
  "invoice-me"
  "rapid-photo-upload"
)

REGION="us-west-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

for PROJECT in "${PROJECTS[@]}"; do
  BUCKET="teamfront-${PROJECT}-frontend"
  
  echo "Setting up ${PROJECT}..."
  
  # Create bucket
  aws s3 mb s3://${BUCKET} --region ${REGION} 2>/dev/null || echo "Bucket may already exist"
  
  # Enable static website hosting
  aws s3 website s3://${BUCKET} --index-document index.html --error-document 404.html
  
  # Configure public access block to allow public read policies (but block ACLs)
  # This allows bucket policies to grant public read access while preventing ACL-based public access
  aws s3api put-public-access-block \
    --bucket ${BUCKET} \
    --public-access-block-configuration \
      "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"
  
  # Create OAC
  OAC_OUTPUT=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config \
      Name=${PROJECT}-oac,OriginAccessControlOriginType=s3,SigningBehavior=always,SigningProtocol=sigv4 \
    --query 'OriginAccessControl.{Id:Id}' --output text)
  
  echo "Created OAC for ${PROJECT}: ${OAC_OUTPUT}"
  echo "Next: Create CloudFront distribution using OAC ID: ${OAC_OUTPUT}"
done
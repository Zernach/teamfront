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
  
  # Disable ALL public access blocks to make bucket fully public
  aws s3api put-public-access-block \
    --bucket ${BUCKET} \
    --public-access-block-configuration \
      "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
  
  # Apply public read bucket policy
  echo "Applying public read bucket policy..."
  aws s3api put-bucket-policy \
    --bucket ${BUCKET} \
    --policy "{
      \"Version\": \"2012-10-17\",
      \"Statement\": [
        {
          \"Sid\": \"PublicReadGetObject\",
          \"Effect\": \"Allow\",
          \"Principal\": \"*\",
          \"Action\": \"s3:GetObject\",
          \"Resource\": \"arn:aws:s3:::${BUCKET}/*\"
        }
      ]
    }"
  
  echo "✓ Bucket ${BUCKET} is now fully publicly accessible"
  
  # Create or get existing OAC (for CloudFront, but bucket is also directly accessible)
  OAC_NAME="${PROJECT}-oac"
  OAC_OUTPUT=$(aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='${OAC_NAME}'].Id" --output text 2>/dev/null || echo "")
  
  if [ -z "$OAC_OUTPUT" ]; then
    # OAC doesn't exist, create it
    OAC_OUTPUT=$(aws cloudfront create-origin-access-control \
      --origin-access-control-config \
        Name=${OAC_NAME},OriginAccessControlOriginType=s3,SigningBehavior=always,SigningProtocol=sigv4 \
      --query 'OriginAccessControl.{Id:Id}' --output text)
    echo "Created OAC for ${PROJECT}: ${OAC_OUTPUT}"
  else
    echo "OAC already exists for ${PROJECT}: ${OAC_OUTPUT}"
  fi
  
  echo "Next: Create CloudFront distribution using OAC ID: ${OAC_OUTPUT}"
  
  # Special case: rapid-photo-upload needs an additional bucket for uploaded images
  if [ "$PROJECT" = "rapid-photo-upload" ]; then
    IMAGES_BUCKET="teamfront-${PROJECT}-images"
    echo "Setting up images bucket for ${PROJECT}..."
    
    # Create images bucket
    aws s3 mb s3://${IMAGES_BUCKET} --region ${REGION} 2>/dev/null || echo "Images bucket may already exist"
    
    # Disable ALL public access blocks for images bucket to make it fully public
    aws s3api put-public-access-block \
      --bucket ${IMAGES_BUCKET} \
      --public-access-block-configuration \
        "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
    
    # Apply public read bucket policy for images
    echo "Applying public read bucket policy to images bucket..."
    aws s3api put-bucket-policy \
      --bucket ${IMAGES_BUCKET} \
      --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
          {
            \"Sid\": \"PublicReadGetObject\",
            \"Effect\": \"Allow\",
            \"Principal\": \"*\",
            \"Action\": [\"s3:GetObject\", \"s3:PutObject\"],
            \"Resource\": \"arn:aws:s3:::${IMAGES_BUCKET}/*\"
          }
        ]
      }"
    
    echo "✓ Images bucket ${IMAGES_BUCKET} is now fully publicly accessible"
    
    # Enable versioning for images bucket (optional, for data protection)
    aws s3api put-bucket-versioning \
      --bucket ${IMAGES_BUCKET} \
      --versioning-configuration Status=Enabled
    
    # Configure CORS for images bucket
    aws s3api put-bucket-cors \
      --bucket ${IMAGES_BUCKET} \
      --cors-configuration '{
        "CORSRules": [
          {
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
          }
        ]
      }'
    
    # Configure lifecycle policy to manage storage costs (optional)
    aws s3api put-bucket-lifecycle-configuration \
      --bucket ${IMAGES_BUCKET} \
      --lifecycle-configuration '{
        "Rules": [
          {
            "ID": "Move to IA after 30 days",
            "Filter": {},
            "Status": "Enabled",
            "Transitions": [
              {
                "Days": 30,
                "StorageClass": "STANDARD_IA"
              }
            ],
            "NoncurrentVersionExpiration": {
              "NoncurrentDays": 90
            }
          }
        ]
      }'
    
    echo "Images bucket created: ${IMAGES_BUCKET}"
  fi
done
#!/bin/bash
# Don't exit on error - we want to deploy all projects even if one fails
set +e

PROJECTS=(
  "invoice-me"
  "rapid-photo-upload"
  "smart-scheduler"
)

# Map projects to their Elastic Beanstalk environment names
declare -A EB_ENVIRONMENTS
EB_ENVIRONMENTS["invoice-me"]="teamfront-invoice-me-archlife"
EB_ENVIRONMENTS["rapid-photo-upload"]="teamfront-rapid-photo-upload-archlife"
EB_ENVIRONMENTS["smart-scheduler"]="teamfront-smart-scheduler-archlife"

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

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "Error: Elastic Beanstalk CLI is not installed. Please install it first."
    echo "Install with: pip install awsebcli"
    exit 1
fi

echo "Building and deploying all backends..."
echo ""

FAILED_PROJECTS=()
SUCCESSFUL_PROJECTS=()

for PROJECT in "${PROJECTS[@]}"; do
  BACKEND_DIR="${PROJECT}/backend"
  EB_ENV="${EB_ENVIRONMENTS[$PROJECT]}"
  
  echo "=========================================="
  echo "=== ${PROJECT} ==="
  echo "=========================================="
  
  # Check if backend directory exists
  if [ ! -d "$BACKEND_DIR" ]; then
    echo "Error: Backend directory ${BACKEND_DIR} does not exist!"
    FAILED_PROJECTS+=("${PROJECT}")
    echo ""
    continue
  fi
  
  # Change to backend directory
  cd "$BACKEND_DIR" || {
    echo "Error: Failed to change to ${BACKEND_DIR}"
    FAILED_PROJECTS+=("${PROJECT}")
    echo ""
    continue
  }
  
  # Check if deploy.sh exists and is executable
  if [ -f "./deploy.sh" ]; then
    echo "Running deploy.sh for ${PROJECT}..."
    chmod +x ./deploy.sh
    ./deploy.sh
    DEPLOY_EXIT_CODE=$?
  else
    echo "Warning: deploy.sh not found. Attempting direct deployment..."
    
    # Fallback: try to build and deploy based on project type
    if [ "$PROJECT" = "smart-scheduler" ]; then
      # C# .NET project
      echo "Building ${PROJECT} backend..."
      dotnet restore
      dotnet publish -c Release -r linux-x64 --self-contained true -o ./publish
      if [ $? -ne 0 ]; then
        echo "Error: Build failed for ${PROJECT}"
        FAILED_PROJECTS+=("${PROJECT}")
        cd - > /dev/null
        echo ""
        continue
      fi
      
      # Copy published files to root for EB deployment
      cp -r publish/* ./
      chmod +x ./SmartScheduler 2>/dev/null || true
      
      echo "Deploying to Elastic Beanstalk: ${EB_ENV}..."
      eb deploy "${EB_ENV}"
      DEPLOY_EXIT_CODE=$?
      
      # Clean up build files from root
      find . -maxdepth 1 -type f \( -name "*.dll" -o -name "*.so" -o -name "*.pdb" -o -name "SmartScheduler" -o -name "createdump" -o -name "*.runtimeconfig.json" -o -name "*.deps.json" \) -delete 2>/dev/null || true
      rm -rf bin/ 2>/dev/null || true
    else
      # Java/Spring Boot project
      echo "Building ${PROJECT} backend..."
      mvn clean package
      if [ $? -ne 0 ]; then
        echo "Error: Build failed for ${PROJECT}"
        FAILED_PROJECTS+=("${PROJECT}")
        cd - > /dev/null
        echo ""
        continue
      fi
      
      # Copy JAR to root if needed
      JAR_FILE=$(find target -name "*.jar" -type f | head -1)
      if [ -n "$JAR_FILE" ]; then
        cp "$JAR_FILE" "./$(basename $JAR_FILE)"
      fi
      
      echo "Deploying to Elastic Beanstalk: ${EB_ENV}..."
      eb deploy "${EB_ENV}"
      DEPLOY_EXIT_CODE=$?
    fi
  fi
  
  if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
    echo "Error: Deployment failed for ${PROJECT}"
    FAILED_PROJECTS+=("${PROJECT}")
    cd - > /dev/null
    echo ""
    continue
  fi
  
  # Ensure public access is configured (including CloudFront traffic)
  echo "Ensuring public access is configured (allows CloudFront and all other traffic)..."
  REGION="us-west-1"
  
  # Get load balancer security groups and open them up
  LB_ARN=$(aws elasticbeanstalk describe-environment-resources \
    --environment-name "${EB_ENV}" \
    --region ${REGION} \
    --query 'EnvironmentResources.LoadBalancers[0].Name' \
    --output text 2>/dev/null || echo "")
  
  if [ -n "$LB_ARN" ] && [ "$LB_ARN" != "None" ] && [ "$LB_ARN" != "" ]; then
    LB_TYPE=$(aws elasticbeanstalk describe-environment-resources \
      --environment-name "${EB_ENV}" \
      --region ${REGION} \
      --query 'EnvironmentResources.LoadBalancers[0].Type' \
      --output text 2>/dev/null || echo "classic")
    
    if [ "$LB_TYPE" = "application" ] || [ "$LB_TYPE" = "network" ]; then
      ALB_ARN=$(aws elbv2 describe-load-balancers \
        --region ${REGION} \
        --query "LoadBalancers[?LoadBalancerName=='${LB_ARN}'].LoadBalancerArn" \
        --output text 2>/dev/null || echo "")
      
      if [ -n "$ALB_ARN" ] && [ "$ALB_ARN" != "None" ]; then
        ALB_SG=$(aws elbv2 describe-load-balancers \
          --load-balancer-arns "${ALB_ARN}" \
          --region ${REGION} \
          --query 'LoadBalancers[0].SecurityGroups[0]' \
          --output text 2>/dev/null || echo "")
        
        if [ -n "$ALB_SG" ] && [ "$ALB_SG" != "None" ]; then
          aws ec2 authorize-security-group-ingress \
            --group-id "${ALB_SG}" \
            --protocol tcp \
            --port 80 \
            --cidr 0.0.0.0/0 \
            --region ${REGION} 2>/dev/null || true
          aws ec2 authorize-security-group-ingress \
            --group-id "${ALB_SG}" \
            --protocol tcp \
            --port 443 \
            --cidr 0.0.0.0/0 \
            --region ${REGION} 2>/dev/null || true
        fi
      fi
    else
      CLB_SG=$(aws elb describe-load-balancers \
        --load-balancer-names "${LB_ARN}" \
        --region ${REGION} \
        --query 'LoadBalancerDescriptions[0].SecurityGroups[0]' \
        --output text 2>/dev/null || echo "")
      
      if [ -n "$CLB_SG" ] && [ "$CLB_SG" != "None" ]; then
        aws ec2 authorize-security-group-ingress \
          --group-id "${CLB_SG}" \
          --protocol tcp \
          --port 80 \
          --cidr 0.0.0.0/0 \
          --region ${REGION} 2>/dev/null || true
        aws ec2 authorize-security-group-ingress \
          --group-id "${CLB_SG}" \
          --protocol tcp \
          --port 443 \
          --cidr 0.0.0.0/0 \
          --region ${REGION} 2>/dev/null || true
      fi
    fi
  fi
  
  # Get EC2 instance security groups and open them up
  INSTANCE_IDS=$(aws elasticbeanstalk describe-environment-resources \
    --environment-name "${EB_ENV}" \
    --region ${REGION} \
    --query 'EnvironmentResources.Instances[*].Id' \
    --output text 2>/dev/null || echo "")
  
  if [ -n "$INSTANCE_IDS" ] && [ "$INSTANCE_IDS" != "None" ]; then
    for INSTANCE_ID in $INSTANCE_IDS; do
      INSTANCE_SGS=$(aws ec2 describe-instances \
        --instance-ids "${INSTANCE_ID}" \
        --region ${REGION} \
        --query 'Reservations[0].Instances[0].SecurityGroups[*].GroupId' \
        --output text 2>/dev/null || echo "")
      
      if [ -n "$INSTANCE_SGS" ] && [ "$INSTANCE_SGS" != "None" ]; then
        for SG_ID in $INSTANCE_SGS; do
          aws ec2 authorize-security-group-ingress \
            --group-id "${SG_ID}" \
            --protocol tcp \
            --port 80 \
            --cidr 0.0.0.0/0 \
            --region ${REGION} 2>/dev/null || true
          aws ec2 authorize-security-group-ingress \
            --group-id "${SG_ID}" \
            --protocol tcp \
            --port 443 \
            --cidr 0.0.0.0/0 \
            --region ${REGION} 2>/dev/null || true
        done
      fi
    done
  fi
  
  echo "✓ Deployment complete for ${PROJECT}!"
  echo "✓ Public access configured!"
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
    EB_ENV="${EB_ENVIRONMENTS[$PROJECT]}"
    echo ""
    echo "  ${PROJECT}:"
    echo "    Environment: ${EB_ENV}"
    echo "    URL: https://${EB_ENV}.us-west-1.elasticbeanstalk.com"
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


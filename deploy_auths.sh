#!/bin/sh
# Configure AWS authentication for each project
# POSIX-compatible script that works with both sh and bash

set -e

PROJECTS="invoice-me rapid-photo-upload smart-scheduler"

# Function to get AWS profile name for a project (POSIX-compatible)
get_aws_profile() {
    case "$1" in
        invoice-me)
            echo "invoice-me"
            ;;
        rapid-photo-upload)
            echo "rapid-photo-upload"
            ;;
        smart-scheduler)
            echo "smart-scheduler"
            ;;
        *)
            echo "$1"
            ;;
    esac
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it first."
    echo "Install with: brew install awscli (macOS) or pip install awscli"
    exit 1
fi

echo "=========================================="
echo "=== AWS Authentication Configuration ==="
echo "=========================================="
echo ""
echo "This script will configure AWS credentials for each project."
echo "Each project will have its own AWS profile."
echo ""

# Function to configure AWS credentials for a project
configure_project_auth() {
    PROJECT=$1
    PROFILE_NAME=$(get_aws_profile "$PROJECT")
    
    echo "=========================================="
    echo "=== Configuring ${PROJECT} ==="
    echo "=========================================="
    echo ""
    echo "Profile name: ${PROFILE_NAME}"
    echo ""
    
    # Check if profile already exists
    if aws configure list-profiles 2>/dev/null | grep -q "^${PROFILE_NAME}$"; then
        echo "Profile '${PROFILE_NAME}' already exists."
        read -p "Do you want to reconfigure it? (y/n): " RECONFIGURE
        if [ "$RECONFIGURE" != "y" ] && [ "$RECONFIGURE" != "Y" ]; then
            echo "Skipping ${PROJECT}..."
            echo ""
            return 0
        fi
    fi
    
    echo "Please provide AWS credentials for ${PROJECT}:"
    echo ""
    
    # Get AWS Access Key ID
    read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
    if [ -z "$AWS_ACCESS_KEY_ID" ]; then
        echo "Error: AWS Access Key ID cannot be empty. Skipping ${PROJECT}..."
        echo ""
        return 1
    fi
    
    # Get AWS Secret Access Key (hidden input)
    read -sp "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    echo ""
    if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        echo "Error: AWS Secret Access Key cannot be empty. Skipping ${PROJECT}..."
        echo ""
        return 1
    fi
    
    # Get AWS Region (default to us-west-1)
    read -p "AWS Region [us-west-1]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-west-1}
    
    # Get Output Format (default to json)
    read -p "Output format [json]: " AWS_OUTPUT
    AWS_OUTPUT=${AWS_OUTPUT:-json}
    
    # Configure AWS credentials
    echo ""
    echo "Configuring AWS profile '${PROFILE_NAME}'..."
    
    aws configure set aws_access_key_id "${AWS_ACCESS_KEY_ID}" --profile "${PROFILE_NAME}"
    aws configure set aws_secret_access_key "${AWS_SECRET_ACCESS_KEY}" --profile "${PROFILE_NAME}"
    aws configure set region "${AWS_REGION}" --profile "${PROFILE_NAME}"
    aws configure set output "${AWS_OUTPUT}" --profile "${PROFILE_NAME}"
    
    # Test the credentials
    echo "Testing credentials for ${PROJECT}..."
    if aws sts get-caller-identity --profile "${PROFILE_NAME}" &> /dev/null; then
        ACCOUNT_ID=$(aws sts get-caller-identity --profile "${PROFILE_NAME}" --query 'Account' --output text 2>/dev/null)
        USER_ARN=$(aws sts get-caller-identity --profile "${PROFILE_NAME}" --query 'Arn' --output text 2>/dev/null)
        echo "✓ Credentials verified successfully!"
        echo "  Account ID: ${ACCOUNT_ID}"
        echo "  User ARN: ${USER_ARN}"
    else
        echo "✗ Error: Failed to verify credentials for ${PROJECT}"
        echo "  Please check your credentials and try again."
        return 1
    fi
    
    echo ""
}

# Function to verify existing credentials
verify_project_auth() {
    PROJECT=$1
    PROFILE_NAME=$(get_aws_profile "$PROJECT")
    
    echo "Verifying credentials for ${PROJECT} (profile: ${PROFILE_NAME})..."
    
    if aws sts get-caller-identity --profile "${PROFILE_NAME}" &> /dev/null; then
        ACCOUNT_ID=$(aws sts get-caller-identity --profile "${PROFILE_NAME}" --query 'Account' --output text 2>/dev/null)
        USER_ARN=$(aws sts get-caller-identity --profile "${PROFILE_NAME}" --query 'Arn' --output text 2>/dev/null)
        echo "✓ ${PROJECT}: Credentials are valid"
        echo "  Account ID: ${ACCOUNT_ID}"
        echo "  User ARN: ${USER_ARN}"
        return 0
    else
        echo "✗ ${PROJECT}: Credentials are invalid or not configured"
        return 1
    fi
}

# Main menu
echo "What would you like to do?"
echo ""
echo "1) Configure AWS credentials for all projects"
echo "2) Configure AWS credentials for a specific project"
echo "3) Verify existing AWS credentials"
echo "4) List all configured profiles"
echo ""
read -p "Enter your choice [1-4]: " CHOICE

case $CHOICE in
    1)
        echo ""
        echo "Configuring AWS credentials for all projects..."
        echo ""
        
        FAILED_PROJECTS=""
        SUCCESSFUL_PROJECTS=""
        
        for PROJECT in $PROJECTS; do
            if configure_project_auth "$PROJECT"; then
                SUCCESSFUL_PROJECTS="${SUCCESSFUL_PROJECTS} ${PROJECT}"
            else
                FAILED_PROJECTS="${FAILED_PROJECTS} ${PROJECT}"
            fi
        done
        
        # Summary
        echo "=========================================="
        echo "=== Configuration Summary ==="
        echo "=========================================="
        
        if [ -n "$SUCCESSFUL_PROJECTS" ]; then
            echo ""
            echo "✓ Successfully configured:"
            for PROJECT in $SUCCESSFUL_PROJECTS; do
                PROFILE_NAME=$(get_aws_profile "$PROJECT")
                echo "  - ${PROJECT} (profile: ${PROFILE_NAME})"
            done
        fi
        
        if [ -n "$FAILED_PROJECTS" ]; then
            echo ""
            echo "✗ Failed to configure:"
            for PROJECT in $FAILED_PROJECTS; do
                echo "  - ${PROJECT}"
            done
            exit 1
        fi
        
        echo ""
        echo "All projects configured successfully!"
        ;;
        
    2)
        echo ""
        echo "Select a project to configure:"
        PROJECT_LIST=""
        COUNT=1
        for PROJECT in $PROJECTS; do
            echo "${COUNT}) ${PROJECT}"
            PROJECT_LIST="${PROJECT_LIST} ${PROJECT}"
            COUNT=$((COUNT + 1))
        done
        echo ""
        read -p "Enter project number: " PROJECT_NUM
        
        COUNT=1
        SELECTED_PROJECT=""
        for PROJECT in $PROJECTS; do
            if [ "$COUNT" -eq "$PROJECT_NUM" ]; then
                SELECTED_PROJECT="$PROJECT"
                break
            fi
            COUNT=$((COUNT + 1))
        done
        
        if [ -n "$SELECTED_PROJECT" ]; then
            configure_project_auth "$SELECTED_PROJECT"
        else
            echo "Error: Invalid project number"
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "Verifying AWS credentials for all projects..."
        echo ""
        
        FAILED_PROJECTS=""
        SUCCESSFUL_PROJECTS=""
        
        for PROJECT in $PROJECTS; do
            PROFILE_NAME=$(get_aws_profile "$PROJECT")
            
            if aws configure list-profiles 2>/dev/null | grep -q "^${PROFILE_NAME}$"; then
                if verify_project_auth "$PROJECT"; then
                    SUCCESSFUL_PROJECTS="${SUCCESSFUL_PROJECTS} ${PROJECT}"
                else
                    FAILED_PROJECTS="${FAILED_PROJECTS} ${PROJECT}"
                fi
            else
                echo "✗ ${PROJECT}: Profile '${PROFILE_NAME}' not found"
                FAILED_PROJECTS="${FAILED_PROJECTS} ${PROJECT}"
            fi
            echo ""
        done
        
        # Summary
        echo "=========================================="
        echo "=== Verification Summary ==="
        echo "=========================================="
        
        if [ -n "$SUCCESSFUL_PROJECTS" ]; then
            echo ""
            echo "✓ Valid credentials:"
            for PROJECT in $SUCCESSFUL_PROJECTS; do
                echo "  - ${PROJECT}"
            done
        fi
        
        if [ -n "$FAILED_PROJECTS" ]; then
            echo ""
            echo "✗ Invalid or missing credentials:"
            for PROJECT in $FAILED_PROJECTS; do
                echo "  - ${PROJECT}"
            done
            exit 1
        fi
        
        echo ""
        echo "All credentials are valid!"
        ;;
        
    4)
        echo ""
        echo "Configured AWS profiles:"
        echo ""
        aws configure list-profiles 2>/dev/null || echo "No profiles configured"
        echo ""
        ;;
        
    *)
        echo "Error: Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "To use a specific profile in deployment scripts, set AWS_PROFILE:"
echo "  export AWS_PROFILE=invoice-me"
echo "  ./deploy_backends.sh"
echo ""
echo "Or use the --profile flag with AWS CLI commands:"
echo "  aws s3 ls --profile invoice-me"
echo ""


#!/bin/sh
# Configure AWS authentication and Cognito for each project
# ALWAYS creates BRAND NEW User Pools and app clients with unique timestamp-based names
# POSIX-compatible script that works with both sh and bash

set -e

PROJECTS="invoice-me rapid-photo-upload smart-scheduler"
REGION="${AWS_REGION:-us-west-1}"

# Function to update app.json with Cognito config
update_app_json() {
    PROJECT=$1
    CLIENT_ID=$2
    CLIENT_SECRET=$3
    
    APP_JSON="${PROJECT}/frontend/app.json"
    
    if [ ! -f "$APP_JSON" ]; then
        echo "  ⚠ Warning: ${APP_JSON} not found, skipping update"
        return 1
    fi
    
    # Backup original
    cp "${APP_JSON}" "${APP_JSON}.backup"
    echo "  ✓ Backed up ${APP_JSON}"
    
    # Check if jq is available
    if command -v jq &> /dev/null; then
        # Update using jq
        TEMP_FILE=$(mktemp)
        if [ -n "$CLIENT_SECRET" ] && [ "$CLIENT_SECRET" != "None" ]; then
            jq --arg user_pool "$USER_POOL_ID" \
               --arg client_id "$CLIENT_ID" \
               --arg region "$REGION" \
               --arg secret "$CLIENT_SECRET" \
               '.expo.extra.EXPO_PUBLIC_COGNITO_USER_POOL_ID = $user_pool | 
                .expo.extra.EXPO_PUBLIC_COGNITO_CLIENT_ID = $client_id | 
                .expo.extra.EXPO_PUBLIC_COGNITO_REGION = $region |
                .expo.extra.EXPO_PUBLIC_COGNITO_CLIENT_SECRET = $secret' \
               "${APP_JSON}" > "${TEMP_FILE}"
        else
            # No secret - public client
            jq --arg user_pool "$USER_POOL_ID" \
               --arg client_id "$CLIENT_ID" \
               --arg region "$REGION" \
               '.expo.extra.EXPO_PUBLIC_COGNITO_USER_POOL_ID = $user_pool | 
                .expo.extra.EXPO_PUBLIC_COGNITO_CLIENT_ID = $client_id | 
                .expo.extra.EXPO_PUBLIC_COGNITO_REGION = $region |
                del(.expo.extra.EXPO_PUBLIC_COGNITO_CLIENT_SECRET)' \
               "${APP_JSON}" > "${TEMP_FILE}"
        fi
        mv "${TEMP_FILE}" "${APP_JSON}"
        echo "  ✓ Updated ${APP_JSON}"
    else
        echo "  ⚠ jq not installed, displaying config instead:"
        echo "    EXPO_PUBLIC_COGNITO_USER_POOL_ID=${USER_POOL_ID}"
        echo "    EXPO_PUBLIC_COGNITO_CLIENT_ID=${CLIENT_ID}"
        echo "    EXPO_PUBLIC_COGNITO_REGION=${REGION}"
        if [ -n "$CLIENT_SECRET" ] && [ "$CLIENT_SECRET" != "None" ]; then
            echo "    EXPO_PUBLIC_COGNITO_CLIENT_SECRET=${CLIENT_SECRET}"
        fi
    fi
}

# Function to setup Cognito User Pool and app clients
setup_cognito() {
    USE_SECRETS=$1
    AUTO_UPDATE=$2
    
    echo "=========================================="
    echo "=== AWS Cognito User Pool Setup ==="
    echo "=========================================="
    echo ""
    echo "Region: ${REGION}"
    echo "Strategy: BRAND NEW User Pools per project (with unique timestamps)"
    echo ""
    
    if [ "$USE_SECRETS" = "no-secret" ]; then
        echo "Mode: Creating BRAND NEW PUBLIC clients (no secrets - RECOMMENDED)"
        echo ""
        echo "⚠️  This will ALWAYS create BRAND NEW User Pools and app clients without secrets."
        echo "    Each run generates fresh authentication profiles with unique names."
        echo "    Recommended for mobile/web apps (React Native/Expo)."
        echo ""
    else
        echo "Mode: Creating BRAND NEW PRIVATE clients (with secrets)"
        echo ""
        echo "⚠️  This will ALWAYS create BRAND NEW User Pools and app clients with secrets."
        echo "    Each run generates fresh authentication profiles with unique names."
        echo "    Client secrets should only be used for backend services."
        echo "    For public apps, use the 'no-secret' option instead."
        echo ""
    fi
    
    if [ "$AUTO_UPDATE" = "auto-update" ]; then
        echo "✓ Will automatically update app.json files"
        echo ""
    fi
    
    # Generate timestamp for unique naming
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    
    echo "Creating BRAND NEW User Pools for each project with timestamp: ${TIMESTAMP}"
    echo ""
    
    # Process each project separately
    for PROJECT in $PROJECTS; do
        echo "=========================================="
        echo "=== Setting up ${PROJECT} ==="
        echo "=========================================="
        echo ""
        
        # Get the AWS profile for this project
        PROJECT_PROFILE=$(get_aws_profile "$PROJECT")
        
        # Verify profile exists and credentials are valid
        if ! aws configure list-profiles 2>/dev/null | grep -q "^${PROJECT_PROFILE}$"; then
            echo "⚠️  Warning: Profile '${PROJECT_PROFILE}' not found. Skipping ${PROJECT}."
            echo "   Run option 1 or 2 from the main menu to configure credentials first."
            echo ""
            continue
        fi
        
        if ! aws sts get-caller-identity --profile "${PROJECT_PROFILE}" &> /dev/null; then
            echo "⚠️  Warning: Invalid credentials for profile '${PROJECT_PROFILE}'. Skipping ${PROJECT}."
            echo ""
            continue
        fi
        
        PROFILE_ARG="--profile ${PROJECT_PROFILE}"
        
        # User Pool name with timestamp for brand new profile every time
        PROJECT_USER_POOL_NAME="${PROJECT}-auth-${TIMESTAMP}"
        
        echo "Creating BRAND NEW Cognito User Pool for ${PROJECT}..."
        echo "Pool Name: ${PROJECT_USER_POOL_NAME}"
        echo ""
        
        # Always create new user pool (no checking for existing)
        # LOW SECURITY: Simple password, no email verification required
        USER_POOL_ID=$(aws cognito-idp create-user-pool \
            --pool-name "${PROJECT_USER_POOL_NAME}" \
            --policies "PasswordPolicy={MinimumLength=6,RequireUppercase=false,RequireLowercase=false,RequireNumbers=false,RequireSymbols=false}" \
            --username-attributes email \
            --mfa-configuration OFF \
            --region ${REGION} \
            ${PROFILE_ARG} \
            --query 'UserPool.Id' \
            --output text)
        
        echo "✓ NEW User Pool created: ${USER_POOL_ID} (LOW SECURITY - no email verification)"
        echo ""
        echo "User Pool ID: ${USER_POOL_ID}"
        echo ""
        
        # Determine client name with timestamp - always brand new
        if [ "$USE_SECRETS" = "no-secret" ]; then
            CLIENT_NAME="${PROJECT}-public-client-${TIMESTAMP}"
        else
            CLIENT_NAME="${PROJECT}-client-${TIMESTAMP}"
        fi
        
        echo "Creating BRAND NEW app client..."
        echo "Client Name: ${CLIENT_NAME}"
        echo ""
        
        # Always create new client (no checking for existing)
        # Build the command with proper quoting
        TOKEN_VALIDITY_UNITS="AccessToken=hours,IdToken=hours,RefreshToken=days"
        
        # Create the app client with or without secret
        if [ "$USE_SECRETS" = "no-secret" ]; then
            # Public client without secret (RECOMMENDED for mobile/web) - LOW SECURITY
            CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client \
                --user-pool-id "${USER_POOL_ID}" \
                --client-name "${CLIENT_NAME}" \
                --no-generate-secret \
                --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_ADMIN_USER_PASSWORD_AUTH \
                --token-validity-units "${TOKEN_VALIDITY_UNITS}" \
                --access-token-validity 24 \
                --id-token-validity 24 \
                --refresh-token-validity 365 \
                --prevent-user-existence-errors ENABLED \
                --read-attributes email \
                --write-attributes email \
                --region "${REGION}" \
                ${PROFILE_ARG} \
                --query 'UserPoolClient.ClientId' \
                --output text 2>&1)
        else
            # Private client with secret (for backend services)
            CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client \
                --user-pool-id "${USER_POOL_ID}" \
                --client-name "${CLIENT_NAME}" \
                --generate-secret \
                --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
                --token-validity-units "${TOKEN_VALIDITY_UNITS}" \
                --access-token-validity 1 \
                --id-token-validity 1 \
                --refresh-token-validity 30 \
                --region "${REGION}" \
                ${PROFILE_ARG} \
                --query 'UserPoolClient.ClientId' \
                --output text 2>&1)
        fi
        
        # Check if the command succeeded (check for error messages)
        if echo "$CLIENT_OUTPUT" | grep -qE "(Unknown options|usage:|error|Error)"; then
            echo "  ✗ Error creating app client:"
            echo "    $CLIENT_OUTPUT"
            continue
        fi
        
        CLIENT_ID="$CLIENT_OUTPUT"
        echo "  ✓ NEW App client created: ${CLIENT_ID}"
        
        # Get client secret (will be empty for public clients)
        CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client \
            --user-pool-id "${USER_POOL_ID}" \
            --client-id "${CLIENT_ID}" \
            --region ${REGION} \
            ${PROFILE_ARG} \
            --query 'UserPoolClient.ClientSecret' \
            --output text 2>/dev/null || echo "")
        
        echo ""
        echo "  ${PROJECT} Configuration:"
        echo "    User Pool ID: ${USER_POOL_ID}"
        echo "    Client ID: ${CLIENT_ID}"
        if [ -n "$CLIENT_SECRET" ] && [ "$CLIENT_SECRET" != "None" ]; then
            echo "    Client Secret: ${CLIENT_SECRET}"
        else
            echo "    Client Type: PUBLIC (no secret)"
        fi
        echo ""
        
        # Auto-update app.json if requested
        if [ "$AUTO_UPDATE" = "auto-update" ]; then
            # Store USER_POOL_ID for update_app_json (it expects this variable)
            update_app_json "$PROJECT" "$CLIENT_ID" "$CLIENT_SECRET"
            echo ""
        else
            echo "  Add these to ${PROJECT} configuration:"
            echo "    EXPO_PUBLIC_COGNITO_USER_POOL_ID=${USER_POOL_ID}"
            echo "    EXPO_PUBLIC_COGNITO_CLIENT_ID=${CLIENT_ID}"
            echo "    EXPO_PUBLIC_COGNITO_REGION=${REGION}"
            if [ -n "$CLIENT_SECRET" ] && [ "$CLIENT_SECRET" != "None" ]; then
                echo "    EXPO_PUBLIC_COGNITO_CLIENT_SECRET=${CLIENT_SECRET}"
            fi
            echo "    AWS_COGNITO_USER_POOL_ID=${USER_POOL_ID}"
            echo ""
        fi
    done
    
    echo "=========================================="
    echo "=== Cognito Setup Complete ==="
    echo "=========================================="
    echo ""
    echo "Region: ${REGION}"
    echo "Timestamp: ${TIMESTAMP}"
    echo ""
    echo "✓ BRAND NEW User Pools and app clients created for each project!"
    echo "  Each profile has a unique timestamp-based name for isolation."
    echo ""
    echo "NOTE: Old User Pools remain in AWS. You can manually delete them"
    echo "      if needed, or use option 7 from the main menu."
    echo ""
}

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

# Function to delete existing user pools (cleanup old pools)
delete_user_pools() {
    echo "=========================================="
    echo "=== Delete Existing User Pools ==="
    echo "=========================================="
    echo ""
    echo "⚠️  WARNING: This will DELETE user pools matching project patterns and ALL user data!"
    echo "   This will search for pools named: ${PROJECT}-auth, ${PROJECT}-auth-v2, and ${PROJECT}-auth-*"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo "Deletion cancelled."
        return 0
    fi
    
    echo ""
    
    for PROJECT in $PROJECTS; do
        echo "Checking ${PROJECT}..."
        PROJECT_PROFILE=$(get_aws_profile "$PROJECT")
        
        # Skip if profile doesn't exist
        if ! aws configure list-profiles 2>/dev/null | grep -q "^${PROJECT_PROFILE}$"; then
            echo "  ⚠️  Profile '${PROJECT_PROFILE}' not found, skipping."
            continue
        fi
        
        PROFILE_ARG="--profile ${PROJECT_PROFILE}"
        
        # Get all user pools for this project (matching any naming pattern)
        ALL_POOLS=$(aws cognito-idp list-user-pools --max-results 60 --region ${REGION} ${PROFILE_ARG} \
            --query "UserPools[?starts_with(Name, '${PROJECT}-auth')].{Name:Name,Id:Id}" \
            --output text 2>/dev/null || echo "")
        
        if [ -z "$ALL_POOLS" ]; then
            echo "  No user pools found for ${PROJECT}"
            echo ""
            continue
        fi
        
        # Parse and delete each pool
        echo "$ALL_POOLS" | while IFS=$'\t' read -r POOL_ID POOL_NAME; do
            if [ -n "$POOL_ID" ] && [ "$POOL_ID" != "None" ]; then
                echo "  Found user pool: ${POOL_NAME} (${POOL_ID})"
                echo "  Deleting..."
                
                aws cognito-idp delete-user-pool \
                    --user-pool-id "${POOL_ID}" \
                    --region ${REGION} \
                    ${PROFILE_ARG} 2>&1
                
                if [ $? -eq 0 ]; then
                    echo "  ✓ Deleted: ${POOL_NAME}"
                else
                    echo "  ✗ Failed to delete: ${POOL_NAME}"
                fi
            fi
        done
        echo ""
    done
    
    echo "User pool deletion complete."
    echo ""
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it first."
    echo "Install with: brew install awscli (macOS) or pip install awscli"
    exit 1
fi

echo "=========================================="
echo "=== AWS Authentication & Cognito Configuration ==="
echo "=========================================="
echo ""
echo "This script will configure AWS credentials and Cognito for each project."
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
# If "cognito" is passed as argument, skip menu and go straight to Cognito setup
# If no argument provided, default to Cognito setup (public clients with auto-update)
if [ "$1" = "cognito" ] || [ "$1" = "--cognito" ] || [ -z "$1" ]; then
    setup_cognito "no-secret" "auto-update"
    exit 0
fi

# Support additional flags
if [ "$1" = "--fix-auth" ]; then
    echo "🔧 Running authentication setup..."
    echo "This will create BRAND NEW public clients without secrets and update app.json files."
    echo "Each run generates fresh User Pools with unique timestamp-based names."
    echo ""
    setup_cognito "no-secret" "auto-update"
    exit 0
fi

if [ "$1" = "--with-secrets" ]; then
    echo "⚠️  Creating BRAND NEW private clients with secrets (for backend services only)"
    echo "Each run generates fresh User Pools with unique timestamp-based names."
    echo ""
    setup_cognito "with-secret" "auto-update"
    exit 0
fi

# If other arguments provided, show menu for credential configuration
echo "What would you like to do?"
echo ""
echo "1) Configure AWS credentials for all projects"
echo "2) Configure AWS credentials for a specific project"
echo "3) Verify existing AWS credentials"
echo "4) Create BRAND NEW Cognito User Pools (PUBLIC clients - RECOMMENDED)"
echo "5) Create BRAND NEW Cognito User Pools (PRIVATE clients - backend only)"
echo "6) List all configured profiles"
echo "7) Delete existing user pools (cleanup old pools)"
echo ""
echo "NOTE: Options 4 & 5 ALWAYS create new User Pools with unique timestamp names."
echo ""
read -p "Enter your choice [1-7]: " CHOICE

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
        setup_cognito "no-secret" "auto-update"
        ;;
        
    5)
        echo ""
        setup_cognito "with-secret" "auto-update"
        ;;
        
    6)
        echo ""
        echo "Configured AWS profiles:"
        echo ""
        aws configure list-profiles 2>/dev/null || echo "No profiles configured"
        echo ""
        ;;
        
    7)
        echo ""
        delete_user_pools
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


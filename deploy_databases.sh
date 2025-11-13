#!/bin/bash
set +e

PROJECTS=(
  "smart-scheduler"
  "invoice-me"
  "rapid-photo-upload"
)

ENVIRONMENTS=("dev" "prod")

REGION="us-west-1"
DB_ENGINE="postgres"
DB_ENGINE_VERSION="15.14"

INSTANCE_TYPE="db.t3.micro"

# Storage sizes for different environments
get_storage_size() {
    case "$1" in
        "dev")
            echo "20"
            ;;
        "prod")
            echo "100"
            ;;
        *)
            echo "20"  # default to dev size
            ;;
    esac
}

if ! command -v aws &> /dev/null; then
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    exit 1
fi

DEFAULT_VPC_ID=$(aws ec2 describe-vpcs \
    --filters "Name=isDefault,Values=true" \
    --query "Vpcs[0].VpcId" \
    --output text \
    --region ${REGION} 2>/dev/null)

if [ -z "$DEFAULT_VPC_ID" ] || [ "$DEFAULT_VPC_ID" == "None" ]; then
    exit 1
fi

SUBNET_IDS=($(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=${DEFAULT_VPC_ID}" \
    --query "Subnets[*].SubnetId" \
    --output text \
    --region ${REGION} 2>/dev/null))

if [ ${#SUBNET_IDS[@]} -lt 2 ]; then
    exit 1
fi

DB_SUBNET_GROUP_NAME="teamfront-db-subnet-group"
aws rds create-db-subnet-group \
    --db-subnet-group-name ${DB_SUBNET_GROUP_NAME} \
    --db-subnet-group-description "Subnet group for teamfront databases" \
    --subnet-ids ${SUBNET_IDS[@]} \
    --region ${REGION} 2>/dev/null > /dev/null

SECURITY_GROUP_NAME="teamfront-rds-sg"
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=${SECURITY_GROUP_NAME}" "Name=vpc-id,Values=${DEFAULT_VPC_ID}" \
    --query "SecurityGroups[0].GroupId" \
    --output text \
    --region ${REGION} 2>/dev/null)

if [ -z "$SG_ID" ] || [ "$SG_ID" == "None" ]; then
    SG_ID=$(aws ec2 create-security-group \
        --group-name ${SECURITY_GROUP_NAME} \
        --description "Security group for teamfront RDS databases" \
        --vpc-id ${DEFAULT_VPC_ID} \
        --region ${REGION} \
        --query 'GroupId' \
        --output text 2>/dev/null)
fi

# Ensure security group allows all incoming connections (0.0.0.0/0) on port 5432
if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
    # Check if rule already exists for 0.0.0.0/0
    EXISTING_RULE=$(aws ec2 describe-security-group-rules \
        --filters "Name=group-id,Values=${SG_ID}" "Name=protocol,Values=tcp" "Name=port-range-from,Values=5432" "Name=port-range-to,Values=5432" \
        --query "SecurityGroupRules[?CidrIpv4=='0.0.0.0/0'].SecurityGroupRuleId" \
        --output text \
        --region ${REGION} 2>/dev/null)
    
    if [ -z "$EXISTING_RULE" ] || [ "$EXISTING_RULE" == "None" ]; then
        # Add rule to allow all traffic from anywhere
        aws ec2 authorize-security-group-ingress \
            --group-id ${SG_ID} \
            --protocol tcp \
            --port 5432 \
            --cidr 0.0.0.0/0 \
            --region ${REGION} 2>/dev/null > /dev/null
    fi
fi

JSON_PARTS=()
ERROR_PARTS=()

for PROJECT in "${PROJECTS[@]}"; do
  for ENV in "${ENVIRONMENTS[@]}"; do
    DB_IDENTIFIER="teamfront-${PROJECT}-${ENV}"
    DB_NAME=$(echo "${PROJECT}_${ENV}" | tr -d '_-' | tr '[:upper:]' '[:lower:]')
    DB_USERNAME=$(echo "${PROJECT}_admin" | tr -d '-' | tr '[:upper:]' '[:lower:]')
    KEY="${PROJECT}-${ENV}"
    ERROR_MSG=""
    
    EXISTING_DB=$(aws rds describe-db-instances \
        --db-instance-identifier ${DB_IDENTIFIER} \
        --region ${REGION} \
        --query "DBInstances[0].DBInstanceStatus" \
        --output text 2>/dev/null)
    
    if [ -n "$EXISTING_DB" ] && [ "$EXISTING_DB" != "None" ]; then
        # Check if database is publicly accessible, if not, modify it
        PUBLICLY_ACCESSIBLE=$(aws rds describe-db-instances \
            --db-instance-identifier ${DB_IDENTIFIER} \
            --region ${REGION} \
            --query "DBInstances[0].PubliclyAccessible" \
            --output text 2>/dev/null)
        
        if [ "$PUBLICLY_ACCESSIBLE" != "True" ]; then
            # Modify database to be publicly accessible
            aws rds modify-db-instance \
                --db-instance-identifier ${DB_IDENTIFIER} \
                --publicly-accessible \
                --apply-immediately \
                --region ${REGION} 2>/dev/null > /dev/null
        fi
        
        ENDPOINT=$(aws rds describe-db-instances \
            --db-instance-identifier ${DB_IDENTIFIER} \
            --region ${REGION} \
            --query "DBInstances[0].Endpoint.Address" \
            --output text 2>/dev/null)
        PORT=$(aws rds describe-db-instances \
            --db-instance-identifier ${DB_IDENTIFIER} \
            --region ${REGION} \
            --query "DBInstances[0].Endpoint.Port" \
            --output text 2>/dev/null)
        
        DB_PASSWORD=$(aws secretsmanager get-secret-value \
            --secret-id ${DB_IDENTIFIER}-credentials \
            --region ${REGION} \
            --query 'SecretString' \
            --output text 2>/dev/null | jq -r '.password' 2>/dev/null)
        
        if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" == "null" ]; then
            DB_PASSWORD="<PASSWORD_REQUIRED>"
        fi
        
        if [ -n "$ENDPOINT" ] && [ "$ENDPOINT" != "None" ] && [ -n "$PORT" ] && [ "$PORT" != "None" ]; then
            CONN_STR="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${ENDPOINT}:${PORT}/${DB_NAME}"
        else
            CONN_STR="postgresql://${DB_USERNAME}:${DB_PASSWORD}@<PENDING>:5432/${DB_NAME}"
        fi
    else
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        STORAGE_SIZE=$(get_storage_size $ENV)
        
        CREATE_CMD="aws rds create-db-instance \
            --db-instance-identifier ${DB_IDENTIFIER} \
            --db-instance-class ${INSTANCE_TYPE} \
            --engine ${DB_ENGINE} \
            --engine-version ${DB_ENGINE_VERSION} \
            --master-username ${DB_USERNAME} \
            --master-user-password ${DB_PASSWORD} \
            --allocated-storage ${STORAGE_SIZE} \
            --storage-type gp3 \
            --db-name ${DB_NAME} \
            --vpc-security-group-ids ${SG_ID} \
            --db-subnet-group-name ${DB_SUBNET_GROUP_NAME} \
            --backup-retention-period $([ "$ENV" == "prod" ] && echo "7" || echo "3") \
            --storage-encrypted \
            --publicly-accessible \
            --region ${REGION} 2>&1"
        
        if [ "$ENV" == "prod" ]; then
            CREATE_CMD="${CREATE_CMD} --multi-az"
        fi
        
        CREATE_OUTPUT=$(eval ${CREATE_CMD} 2>&1)
        CREATE_EXIT=$?
        
        if [ $CREATE_EXIT -eq 0 ]; then
            aws secretsmanager create-secret \
                --name ${DB_IDENTIFIER}-credentials \
                --secret-string "{\"username\":\"${DB_USERNAME}\",\"password\":\"${DB_PASSWORD}\"}" \
                --region ${REGION} 2>/dev/null > /dev/null
            
            CONN_STR="postgresql://${DB_USERNAME}:${DB_PASSWORD}@<PENDING>:5432/${DB_NAME}"
        else
            ERROR_MSG=$(echo "$CREATE_OUTPUT" | grep -i "error\|failed\|denied\|invalid" | head -1 | sed 's/"/\\"/g' | sed 's/^[[:space:]]*//' | head -c 200)
            if [ -z "$ERROR_MSG" ]; then
                ERROR_MSG=$(echo "$CREATE_OUTPUT" | head -3 | tr '\n' ' ' | sed 's/"/\\"/g' | head -c 200)
            fi
            if [ -z "$ERROR_MSG" ]; then
                ERROR_MSG="Database creation failed"
            fi
            CONN_STR="postgresql://${DB_USERNAME}:${DB_PASSWORD}@<FAILED>:5432/${DB_NAME}"
        fi
    fi
    
    if [ -z "$CONN_STR" ]; then
        CONN_STR="postgresql://${DB_USERNAME}:<PASSWORD_REQUIRED>@<NOT_FOUND>:5432/${DB_NAME}"
    fi
    
    JSON_PARTS+=("\"${KEY}\":\"${CONN_STR}\"")
    if [ -n "$ERROR_MSG" ]; then
        ERROR_PARTS+=("\"${KEY}-error\":\"${ERROR_MSG}\"")
    fi
  done
done

if command -v jq &> /dev/null; then
    ALL_PARTS=("${JSON_PARTS[@]}" "${ERROR_PARTS[@]}")
    JSON_STRING="{$(IFS=,; echo "${ALL_PARTS[*]}")}"
    echo "$JSON_STRING" | jq .
else
    echo "{"
    FIRST=true
    for PART in "${JSON_PARTS[@]}"; do
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo ","
        fi
        echo -n "  ${PART}"
    done
    for PART in "${ERROR_PARTS[@]}"; do
        echo ","
        echo -n "  ${PART}"
    done
    echo ""
    echo "}"
fi

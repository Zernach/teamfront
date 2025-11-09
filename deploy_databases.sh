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

declare -A STORAGE_SIZES
STORAGE_SIZES[dev]="20"
STORAGE_SIZES[prod]="100"

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
    
    if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
        aws ec2 authorize-security-group-ingress \
            --group-id ${SG_ID} \
            --protocol tcp \
            --port 5432 \
            --cidr $(aws ec2 describe-vpcs --vpc-ids ${DEFAULT_VPC_ID} --query "Vpcs[0].CidrBlock" --output text --region ${REGION}) \
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
        STORAGE_SIZE=${STORAGE_SIZES[$ENV]}
        
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

#!/bin/bash

# This script sets up the CI/CD environment variables
# Usage: ./scripts/setup-cicd-env.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "Error: Environment must be either 'staging' or 'production'"
  exit 1
fi

# Load common environment variables
source .env

# Set environment-specific variables
if [ "$ENVIRONMENT" = "staging" ]; then
  export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID_STAGING
  export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY_STAGING
  export CLUSTER_NAME="beginner-investor-hub-cluster-staging"
  export SERVICE_NAME="beginner-investor-hub-staging"
  export TASK_DEFINITION="tools-restructured/infrastructure/ecs-task-definition-staging.json"
  export DESIRED_COUNT=1
else
  export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID_PRODUCTION
  export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY_PRODUCTION
  export CLUSTER_NAME="beginner-investor-hub-cluster-production"
  export SERVICE_NAME="beginner-investor-hub-production"
  export TASK_DEFINITION="tools-restructured/infrastructure/ecs-task-definition-prod.json"
  export DESIRED_COUNT=2
fi

# Common variables
export APP_NAME="beginner-investor-hub"
export REGION=${AWS_REGION:-us-east-1}
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REPOSITORY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$APP_NAME"

# Database and Redis configuration
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}"
export REDIS_URL="redis://${REDIS_HOST}:6379"

# JWT configuration
export JWT_SECRET_ARN="arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:jwt-secret"

# AWS credentials ARNs
export AWS_ACCESS_KEY_ID_ARN="arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:aws-access-key-id"
export AWS_SECRET_ACCESS_KEY_ARN="arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:aws-secret-access-key"

# API URL
export API_URL="https://api-$ENVIRONMENT.beginnerinvestorhub.com"

# Generate task definition
echo "Generating task definition for $ENVIRONMENT..."
jq '.
  | .containerDefinitions[0].image = "'$ECR_REPOSITORY':latest"
  | .containerDefinitions[1].image = "'$ECR_REPOSITORY'-frontend:latest"
  | .containerDefinitions[0].environment[] |= (
      if .name == "NODE_ENV" then .value = "'$ENVIRONMENT'"
      elif .name == "DATABASE_URL" then .value = "'$DATABASE_URL'"
      elif .name == "REDIS_URL" then .value = "'$REDIS_URL'"
      else . end
    )
  | .containerDefinitions[1].environment[] |= (
      if .name == "NEXT_PUBLIC_API_URL" then .value = "'$API_URL'"
      elif .name == "NEXT_PUBLIC_ENV" then .value = "'$ENVIRONMENT'"
      else . end
    )
  | .containerDefinitions[0].secrets[] |= (
      if .name == "JWT_SECRET" then .valueFrom = "'$JWT_SECRET_ARN'"
      elif .name == "AWS_ACCESS_KEY_ID" then .valueFrom = "'$AWS_ACCESS_KEY_ID_ARN'"
      elif .name == "AWS_SECRET_ACCESS_KEY" then .valueFrom = "'$AWS_SECRET_ACCESS_KEY_ARN'"
      else . end
    )' \
  tools-restructured/infrastructure/ecs-task-definition.json \
  > "tools-restructured/infrastructure/ecs-task-definition-$ENVIRONMENT.json"

echo "Task definition generated at tools-restructured/infrastructure/ecs-task-definition-$ENVIRONMENT.json"
echo "Environment setup complete for $ENVIRONMENT"

#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENV=""
TAG="latest"
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -e|--env)
      ENV="$2"
      shift # past argument
      shift # past value
      ;;
    -t|--tag)
      TAG="$2"
      shift # past argument
      shift # past value
      ;;
    -f|--force)
      FORCE=true
      shift # past argument
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate environment
if [[ -z "$ENV" ]]; then
  echo -e "${RED}Error: Environment not specified. Use -e or --env to specify the environment (staging|production).${NC}"
  exit 1
fi

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo -e "${RED}Error: Invalid environment. Must be 'staging' or 'production'.${NC}"
  exit 1
fi

# Load environment variables
echo -e "${YELLOW}Loading $ENV environment variables...${NC}"
source .env.$ENV

# Check if required environment variables are set
if [[ -z "$DOCKER_REGISTRY" || -z "$DOCKER_IMAGE" ]]; then
  echo -e "${RED}Error: Required environment variables not set. Please check your .env.$ENV file.${NC}"
  exit 1
fi

# Confirm deployment
if [[ "$FORCE" != true ]]; then
  echo -e "${YELLOW}You are about to deploy the following:${NC}"
  echo -e "  - Environment: ${GREEN}$ENV${NC}"
  echo -e "  - Image: ${GREEN}$DOCKER_REGISTRY/$DOCKER_IMAGE:$TAG${NC}"
  read -p "Are you sure you want to continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
  fi
fi

# Login to Docker registry
echo -e "${YELLOW}Logging in to Docker registry...${NC}"
echo "$DOCKER_PASSWORD" | docker login $DOCKER_REGISTRY -u $DOCKER_USERNAME --password-stdin

# Pull the latest image
echo -e "${YELLOW}Pulling the latest image...${NC}"
docker pull $DOCKER_REGISTRY/$DOCKER_IMAGE:$TAG

# Stop and remove existing containers
echo -e "${YELLOW}Stopping and removing existing containers...${NC}"
docker-compose -f docker-compose.$ENV.yml down || true

# Start new containers
echo -e "${YELLOW}Starting new containers...${NC}"
DOCKER_IMAGE=$DOCKER_REGISTRY/$DOCKER_IMAGE:$TAG docker-compose -f docker-compose.$ENV.yml up -d

# Run database migrations if needed
if [[ "$RUN_MIGRATIONS" == "true" ]]; then
  echo -e "${YELLOW}Running database migrations...${NC}"
  docker-compose -f docker-compose.$ENV.yml exec -T python-engine alembic upgrade head
fi

# Clean up old images
echo -e "${YELLOW}Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}Deployment to $ENV completed successfully!${NC}"

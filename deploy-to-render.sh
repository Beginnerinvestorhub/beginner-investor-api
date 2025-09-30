#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting Deployment Process...${NC}"

# Function to check service health
check_health() {
    local service_url=$1
    local max_retries=30
    local count=0

    echo -e "Checking health for $service_url..."
    
    while [ $count -lt $max_retries ]; do
        if curl -s "$service_url/health" | grep -q "healthy"; then
            echo -e "${GREEN}Service is healthy!${NC}"
            return 0
        fi
        echo -n "."
        sleep 10
        count=$((count + 1))
    done
    
    echo -e "${RED}Health check failed for $service_url${NC}"
    return 1
}sh

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting FinTech Platform Deployment...${NC}"

# Function to check service health
check_health() {
    local service_url=$1
    local max_retries=30
    local count=0

    echo -e "Checking health for $service_url..."
    
    while [ $count -lt $max_retries ]; do
        if curl -s "$service_url/health" | grep -q "healthy"; then
            echo -e "${GREEN}Service is healthy!${NC}"
            return 0
        fi
        echo -n "."
        sleep 10
        count=$((count + 1))
    done
    
    echo -e "${RED}Health check failed for $service_url${NC}"
    return 1
}

# Verify Prerequisites
echo -e "${GREEN}Verifying Prerequisites...${NC}"

# Check Redis Cloud Configuration
if [ -z "$REDIS_URL" ]; then
    echo -e "${RED}Error: REDIS_URL not set. Please configure Redis Cloud first.${NC}"
    exit 1
fi

# Check Firebase Configuration
if [ -z "$FIREBASE_PROJECT_ID" ]; then
    echo -e "${RED}Error: Firebase configuration missing. Please set up Firebase first.${NC}"
    exit 1
fi

# 1. Create and configure PostgreSQL database
echo -e "${GREEN}1. Setting up PostgreSQL database...${NC}"
render db create --name beginner-investor-db --plan starter
render db wait --name beginner-investor-db

# 2. Create Redis instance
echo -e "${GREEN}2. Setting up Redis instance...${NC}"
render redis create --name beginner-investor-redis --plan starter
render redis wait --name beginner-investor-redis

# 3. Deploy Backend API
echo -e "${GREEN}3. Deploying Backend API...${NC}"
render service create --name backend-api --plan starter
render service env set --name backend-api --env-file .env.production
render service deploy --name backend-api
render service wait --name backend-api

# 4. Deploy Investment Engine
echo -e "${GREEN}4. Deploying Investment Engine...${NC}"
render service create --name investment-engine --plan starter
render service env set --name investment-engine --env-file .env.production
render service deploy --name investment-engine
render service wait --name investment-engine

# 5. Deploy AI Engine
echo -e "${GREEN}5. Deploying AI Engine...${NC}"
render service create --name ai-engine --plan starter
render service env set --name ai-engine --env-file .env.production
render service deploy --name ai-engine
render service wait --name ai-engine

# 6. Run database migrations
echo -e "${GREEN}6. Running database migrations...${NC}"
render run --service backend-api -- npm run migrate

# 7. Verify deployments
echo -e "${GREEN}7. Verifying deployments...${NC}"
render service list

echo -e "${GREEN}Deployment complete!${NC}"
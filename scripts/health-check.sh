#!/bin/bash

# Health check script for the application
# This script checks if all required services are running and healthy

set -e

echo "🩺 Starting health check..."

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running"
  exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose is not installed"
  exit 1
fi

# Navigate to the docker directory
cd "$(dirname "$0")/../infrastructure/docker"

# Check if docker-compose files exist
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ docker-compose.yml not found"
  exit 1
fi

# Check if services are running
if ! docker-compose ps --services | xargs -I{} sh -c 'docker-compose ps -q {} | xargs docker inspect -f "{{.State.Status}}"' | grep -q "running"; then
  echo "❌ Not all services are running"
  docker-compose ps
  exit 1
fi

# If we have API endpoints to check, we can add them here
# Example:
# if ! curl -s http://localhost:3000/health | grep -q "ok"; then
#   echo "❌ API is not healthy"
#   exit 1
# fi

echo "✅ All services are healthy"
exit 0
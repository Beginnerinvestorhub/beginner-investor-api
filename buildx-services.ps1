# Initialize buildx
Write-Host "🚀 Initializing Docker Buildx..." -ForegroundColor Cyan
docker buildx create --use --name beginner-investor-builder

# Define target platforms
$PLATFORMS = "linux/amd64,linux/arm64"

# Docker Hub username
$DOCKER_USERNAME = "karingler"

# Define services and their versions
$SERVICES = @(
    "backend-api-service",
    "market-data-ingestion-service",
    "ai-microservice-engine",
    "python-risk-engine",
    "portfolio-simulation-service"
)

# Build each service
foreach ($SERVICE in $SERVICES) {
    Write-Host "🏗️ Building $SERVICE..." -ForegroundColor Green
    
    $BUILD_CONTEXT = "./services/$SERVICE"
    $IMAGE_NAME = "$DOCKER_USERNAME/${SERVICE}:latest"
    
    Write-Host "Building for platforms: $PLATFORMS"
    
    # Build and push in one command using buildx
    docker buildx build `
        --platform $PLATFORMS `
        --tag $IMAGE_NAME `
        --file "$BUILD_CONTEXT/Dockerfile" `
        --cache-from "type=registry,ref=$IMAGE_NAME" `
        --cache-to "type=inline" `
        --push `
        $BUILD_CONTEXT
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build $SERVICE" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🎉 All services built and pushed successfully!" -ForegroundColor Green
Write-Host "Images available at:"
foreach ($SERVICE in $SERVICES) {
    Write-Host "  - docker pull $DOCKER_USERNAME/${SERVICE}:latest"
}
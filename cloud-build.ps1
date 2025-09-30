# Cloud build script for Docker Hub
Write-Host "🚀 Setting up cloud build..." -ForegroundColor Cyan

# Docker Hub username and repository settings
$DOCKER_USERNAME = "karingler"
$PLATFORMS = "linux/amd64,linux/arm64"

# Define services
$SERVICES = @(
    "backend-api-service",
    "market-data-ingestion-service",
    "ai-microservice-engine",
    "python-risk-engine",
    "portfolio-simulation-service"
)

# Build each service using cloud builder
foreach ($SERVICE in $SERVICES) {
    Write-Host "🏗️ Building $SERVICE in cloud..." -ForegroundColor Green
    
    $BUILD_CONTEXT = "./services/$SERVICE"
    $IMAGE_NAME = "$DOCKER_USERNAME/${SERVICE}:latest"
    
    Write-Host "Building $SERVICE for platforms: $PLATFORMS"
    
    # Use docker buildx with cloud builder
    docker buildx build `
        --platform $PLATFORMS `
        --tag $IMAGE_NAME `
        --file "$BUILD_CONTEXT/Dockerfile" `
        --push `
        --builder cloud-karingler-investorhub `
        $BUILD_CONTEXT
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build $SERVICE" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ Successfully built and pushed $SERVICE" -ForegroundColor Green
    }
}

Write-Host "🎉 All services built and pushed to Docker Hub!" -ForegroundColor Green
Write-Host "`nImages available at:"
foreach ($SERVICE in $SERVICES) {
    Write-Host "  - docker pull $DOCKER_USERNAME/${SERVICE}:latest"
}
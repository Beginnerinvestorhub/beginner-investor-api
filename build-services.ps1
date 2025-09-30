# Simple build script - no multi-platform
Write-Host "🚀 Building services..." -ForegroundColor Cyan

# Docker Hub username
$DOCKER_USERNAME = "karingler"

# Define services
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
    
    # Simple docker build command
    docker build `
        -t $IMAGE_NAME `
        -f "$BUILD_CONTEXT/Dockerfile" `
        $BUILD_CONTEXT
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build $SERVICE" -ForegroundColor Red
        exit 1
    }
}

# Test the build by running health checks
Write-Host "🧪 Testing services..." -ForegroundColor Cyan

docker-compose -f ./infrastructure/docker/docker-compose.yml up -d

# Wait for services to be healthy
$MAX_RETRIES = 30
$RETRY_INTERVAL = 10

foreach ($SERVICE in $SERVICES) {
    $RETRIES = 0
    $HEALTHY = $false
    
    Write-Host "Checking health of $SERVICE..." -ForegroundColor Yellow
    
    while (-not $HEALTHY -and $RETRIES -lt $MAX_RETRIES) {
        $STATUS = docker inspect --format '{{.State.Health.Status}}' "fintech_${SERVICE}"
        
        if ($STATUS -eq "healthy") {
            $HEALTHY = $true
            Write-Host "✅ $SERVICE is healthy" -ForegroundColor Green
        } else {
            $RETRIES++
            Write-Host "Waiting for $SERVICE to be healthy (Attempt $RETRIES/$MAX_RETRIES)..."
            Start-Sleep -Seconds $RETRY_INTERVAL
        }
    }
    
    if (-not $HEALTHY) {
        Write-Host "❌ $SERVICE failed to become healthy" -ForegroundColor Red
        docker-compose -f ./infrastructure/docker/docker-compose.yml logs $SERVICE
        docker-compose -f ./infrastructure/docker/docker-compose.yml down
        exit 1
    }
}

Write-Host "🎉 All services built and tested successfully!" -ForegroundColor Green

# Clean up
Write-Host "🧹 Cleaning up..." -ForegroundColor Cyan
docker-compose -f ./infrastructure/docker/docker-compose.yml down

# Replace old cache with new cache
Remove-Item -Path "/tmp/.buildx-cache" -Recurse -ErrorAction SilentlyContinue
Rename-Item -Path "/tmp/.buildx-cache-new" -NewName ".buildx-cache"
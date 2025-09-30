#!/usr/bin/env pwsh

param(
    [switch]$BuildAll,
    [string]$Service
)

$DOCKER_USERNAME = "karingler"
$SERVICES = @(
    "backend-api-service",
    "market-data-ingestion-service",
    "ai-microservice-engine",
    "python-risk-engine",
    "portfolio-simulation-service"
)

function Build-Service {
    param(
        [string]$ServiceName
    )
    Write-Host "🏗️ Building $ServiceName..." -ForegroundColor Green
    
    $BUILD_CONTEXT = "./services/$ServiceName"
    $IMAGE_NAME = "$DOCKER_USERNAME/${ServiceName}:latest"
    
    # Build the image
    docker build `
        -t $IMAGE_NAME `
        -f "$BUILD_CONTEXT/Dockerfile" `
        $BUILD_CONTEXT

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build $ServiceName" -ForegroundColor Red
        return $false
    }

    # Push the image
    Write-Host "📤 Pushing $ServiceName to Docker Hub..." -ForegroundColor Yellow
    docker push $IMAGE_NAME

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push $ServiceName" -ForegroundColor Red
        return $false
    }

    Write-Host "✅ Successfully built and pushed $ServiceName" -ForegroundColor Green
    return $true
}

function Deploy-To-Render {
    param(
        [string]$ServiceName
    )
    Write-Host "🚀 Deploying $ServiceName to Render..." -ForegroundColor Cyan
    
    # Trigger Render deployment using API
    $RENDER_API_KEY = $env:RENDER_API_KEY
    if (-not $RENDER_API_KEY) {
        Write-Host "❌ RENDER_API_KEY environment variable not set" -ForegroundColor Red
        return $false
    }

    $SERVICE_ID = switch ($ServiceName) {
        "backend-api-service" { "backend-api" }
        "python-risk-engine" { "risk-engine" }
        "market-data-ingestion-service" { "market-data" }
        "ai-microservice-engine" { "ai-nudge-service" }
        "portfolio-simulation-service" { "portfolio-simulation" }
    }

    # Trigger deploy
    $Headers = @{
        "Accept" = "application/json"
        "Authorization" = "Bearer $RENDER_API_KEY"
    }

    try {
        $Response = Invoke-RestMethod `
            -Method POST `
            -Uri "https://api.render.com/v1/services/$SERVICE_ID/deploys" `
            -Headers $Headers

        Write-Host "✅ Deployment triggered for $ServiceName" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Failed to trigger deployment for $ServiceName: $_" -ForegroundColor Red
        return $false
    }
}

# Main execution
if ($BuildAll) {
    Write-Host "🚀 Building all services..." -ForegroundColor Cyan
    foreach ($service in $SERVICES) {
        $success = Build-Service -ServiceName $service
        if ($success) {
            Deploy-To-Render -ServiceName $service
        }
    }
}
elseif ($Service) {
    if ($SERVICES -contains $Service) {
        $success = Build-Service -ServiceName $Service
        if ($success) {
            Deploy-To-Render -ServiceName $Service
        }
    }
    else {
        Write-Host "❌ Invalid service name. Available services:" -ForegroundColor Red
        $SERVICES | ForEach-Object { Write-Host "  - $_" }
    }
}
else {
    Write-Host "Please specify either -BuildAll or -Service <service-name>" -ForegroundColor Yellow
    Write-Host "`nAvailable services:"
    $SERVICES | ForEach-Object { Write-Host "  - $_" }
}
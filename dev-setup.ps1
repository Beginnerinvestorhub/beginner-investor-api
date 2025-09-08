# Development Environment Setup Script for Beginner Investor Hub
# Run this script to set up the complete development environment

param(
    [switch]$SkipPython,
    [switch]$SkipNode,
    [switch]$SkipDocker
)

Write-Host "🚀 Setting up Beginner Investor Hub Development Environment" -ForegroundColor Green

# Check prerequisites
function Test-Prerequisites {
    Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
    
    $missing = @()
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $missing += "Node.js (v18+)"
    }
    
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        $missing += "Python (3.8+)"
    }
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        $missing += "Docker Desktop"
    }
    
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "Installing pnpm..." -ForegroundColor Yellow
        npm install -g pnpm
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "❌ Missing prerequisites: $($missing -join ', ')" -ForegroundColor Red
        Write-Host "Please install the missing tools and run this script again." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ All prerequisites found" -ForegroundColor Green
}

# Setup Node.js dependencies
function Setup-NodeDependencies {
    if ($SkipNode) { return }
    
    Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
    
    # Root dependencies
    pnpm install
    
    # Navigate to tools directory for workspace setup
    Set-Location tools
    
    # Frontend dependencies
    if (Test-Path "frontend/package.json") {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
        Set-Location frontend
        pnpm install
        Set-Location ..
    }
    
    # Backend dependencies
    if (Test-Path "backend/package.json") {
        Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
        Set-Location backend
        pnpm install
        Set-Location ..
    }
    
    Set-Location ..
    Write-Host "✅ Node.js dependencies installed" -ForegroundColor Green
}

# Setup Python environments
function Setup-PythonEnvironments {
    if ($SkipPython) { return }
    
    Write-Host "🐍 Setting up Python virtual environments..." -ForegroundColor Yellow
    
    $pythonServices = @(
        "tools/ai_microservice",
        "tools/python-engine"
    )
    
    foreach ($service in $pythonServices) {
        if (Test-Path $service) {
            Write-Host "Setting up $service..." -ForegroundColor Cyan
            Set-Location $service
            
            # Create virtual environment
            if (-not (Test-Path ".venv")) {
                python -m venv .venv
            }
            
            # Activate and install dependencies
            .\.venv\Scripts\Activate.ps1
            if (Test-Path "requirements.txt") {
                pip install -r requirements.txt
            }
            deactivate
            
            Set-Location (Split-Path $service -Parent)
            Set-Location ..
        }
    }
    
    Write-Host "✅ Python environments set up" -ForegroundColor Green
}

# Setup environment files
function Setup-EnvironmentFiles {
    Write-Host "⚙️ Setting up environment files..." -ForegroundColor Yellow
    
    $envFiles = @(
        @{ Source = "tools/frontend/.env.example"; Target = "tools/frontend/.env" },
        @{ Source = "tools/backend/.env.example"; Target = "tools/backend/.env" },
        @{ Source = "tools/python-engine/.env.example"; Target = "tools/python-engine/.env" }
    )
    
    foreach ($env in $envFiles) {
        if ((Test-Path $env.Source) -and (-not (Test-Path $env.Target))) {
            Copy-Item $env.Source $env.Target
            Write-Host "Created $($env.Target)" -ForegroundColor Cyan
        }
    }
    
    Write-Host "✅ Environment files created" -ForegroundColor Green
    Write-Host "⚠️  Please edit the .env files with your actual configuration values" -ForegroundColor Yellow
}

# Setup database
function Setup-Database {
    Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
    
    if (Test-Path "tools/backend/prisma/schema.prisma") {
        Set-Location tools/backend
        
        Write-Host "Generating Prisma client..." -ForegroundColor Cyan
        npx prisma generate
        
        Write-Host "Pushing database schema..." -ForegroundColor Cyan
        npx prisma db push
        
        Set-Location ../..
        Write-Host "✅ Database setup complete" -ForegroundColor Green
    }
}

# Create development scripts
function Create-DevScripts {
    Write-Host "📝 Creating development scripts..." -ForegroundColor Yellow
    
    # Quick start script
    $startScript = @"
# Quick Start Development Servers
Write-Host "🚀 Starting Beginner Investor Hub Development Servers" -ForegroundColor Green

# Start in parallel using background jobs
Start-Job -Name "Frontend" -ScriptBlock { 
    Set-Location "tools/frontend"
    pnpm dev 
}

Start-Job -Name "Backend" -ScriptBlock { 
    Set-Location "tools/backend"
    pnpm dev 
}

Start-Job -Name "Python-AI" -ScriptBlock { 
    Set-Location "tools/ai_microservice"
    .\.venv\Scripts\Activate.ps1
    python start.py
}

Write-Host "✅ All services starting..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Python AI: http://localhost:8000" -ForegroundColor Cyan

Write-Host "Press any key to view job status..." -ForegroundColor Yellow
Read-Host
Get-Job | Format-Table
"@
    
    $startScript | Out-File -FilePath "start-dev.ps1" -Encoding UTF8
    
    Write-Host "✅ Development scripts created" -ForegroundColor Green
}

# Main execution
try {
    Test-Prerequisites
    Setup-NodeDependencies
    Setup-PythonEnvironments
    Setup-EnvironmentFiles
    Setup-Database
    Create-DevScripts
    
    Write-Host "🎉 Development environment setup complete!" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Edit .env files with your configuration" -ForegroundColor White
    Write-Host "2. Run './start-dev.ps1' to start all services" -ForegroundColor White
    Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
    
} catch {
    Write-Host "❌ Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

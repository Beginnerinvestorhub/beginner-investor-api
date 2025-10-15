# ========================================
# BeginnerInvestorHub Powerhouse Diagnostic Script
# Runs: Type Checking, ESLint, Format, Audit, Build Check
# ========================================

param(
    [switch]$SkipOptional
)

# Enable strict mode for better error handling
Set-StrictMode -Version Latest

# Function to write colored output
function Write-ColoredOutput {
    param([string]$Message, [string]$Color = 'White')
    Write-Host $Message -ForegroundColor $Color
}

# Function to run a command and check for errors
function Invoke-CommandWithCheck {
    param([string]$Command, [string]$Description)
    Write-ColoredOutput "Running: $Description" 'Green'
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            Write-ColoredOutput "❌ Error in $Description (Exit Code: $LASTEXITCODE)" 'Red'
            exit 1
        }
    } catch {
        Write-ColoredOutput "❌ Exception in $Description`: $($_.Exception.Message)" 'Red'
        exit 1
    }
}

# Check prerequisites
function Test-Prerequisites {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-ColoredOutput "❌ Node.js is not installed or not in PATH." 'Red'
        exit 1
    }
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-ColoredOutput "❌ npm is not installed or not in PATH." 'Red'
        exit 1
    }
    # Ensure we're in the correct directory (check for package.json)
    if (-not (Test-Path 'package.json')) {
        Write-ColoredOutput "❌ package.json not found. Please run from the project root." 'Red'
        exit 1
    }
}

Write-ColoredOutput "🚀 Running full diagnostics for BeginnerInvestorHub..." 'Cyan'

# Run prerequisites check
Test-Prerequisites

# Step 1: Ensure dependencies are installed
function Install-Dependencies {
    if (-not (Test-Path 'node_modules')) {
        Write-ColoredOutput "📦 Installing missing dependencies..." 'Yellow'
        Invoke-CommandWithCheck 'npm install' 'npm install'
    } else {
        Write-ColoredOutput "✅ Dependencies already installed." 'Green'
    }
}


# Step 2: Check for required developer tools
function Check-DeveloperTools {
    if (-not $SkipOptional) {
        if (-not (Get-Command lighthouse -ErrorAction SilentlyContinue)) {
            Write-ColoredOutput "💡 Installing Lighthouse globally (optional visual audit)..." 'Yellow'
            Invoke-CommandWithCheck 'npm install -g lighthouse' 'Install Lighthouse' | Out-Null
        } else {
            Write-ColoredOutput "✅ Lighthouse already installed." 'Green'
        }
    }
}

# Step 3: Run ESLint
function Run-ESLint {
    if (Test-Path '.eslintrc.js' -or (Test-Path '.eslintrc.json')) {
        Invoke-CommandWithCheck 'npx eslint . --ext .js,.jsx,.ts,.tsx --fix' 'ESLint check and auto-fix'
    } else {
        Write-ColoredOutput "⚠️ No ESLint config found. Creating a default one..." 'Yellow'
        Invoke-CommandWithCheck 'npx eslint --init' 'ESLint init'
    }
}

# Step 4: Run Prettier
function Run-Prettier {
    if (Test-Path '.prettierrc' -or (Test-Path 'prettier.config.js')) {
        Invoke-CommandWithCheck 'npx prettier --write "**/*.{js,jsx,ts,tsx,css,md}"' 'Prettier format'
    } else {
        Write-ColoredOutput "⚠️ No Prettier config found. Skipping." 'Yellow'
    }
}

# Step 5: TypeScript type check
function Run-TypeCheck {
    if (Test-Path 'tsconfig.json') {
        Invoke-CommandWithCheck 'npx tsc --noEmit' 'TypeScript type checking'
    } else {
        Write-ColoredOutput "⚠️ No TypeScript config found (tsconfig.json missing)" 'Yellow'
    }
}

# Step 6: Check Next.js build
function Run-NextBuild {
    $packageJson = Get-Content 'package.json' -Raw | ConvertFrom-Json
    if ($packageJson.dependencies.next -or $packageJson.devDependencies.next) {
        Invoke-CommandWithCheck 'npx next build' 'Next.js build test'
    } else {
        Write-ColoredOutput "⚠️ Next.js not detected in package.json" 'Yellow'
    }
}

# Step 7: Security + dependency audit
function Run-NpmAudit {
    Invoke-CommandWithCheck 'npm audit --audit-level=moderate' 'npm audit'
}
# Execute steps
Install-Dependencies
Check-DeveloperTools
Run-ESLint
Run-Prettier
Run-TypeCheck
Run-NextBuild
Run-NpmAudit

Write-ColoredOutput "`n✅ All checks complete! Review messages above for any warnings or errors." 'Cyan'

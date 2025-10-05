@echo off
REM Database Setup Script for Beginner Investor Hub (Windows)
REM This script sets up PostgreSQL database and runs Prisma migrations

echo 🚀 Setting up database for Beginner Investor Hub...

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not installed.
    echo.
    echo 📋 Installation options:
    echo 1. Install PostgreSQL locally:
    echo    - Download from https://www.postgresql.org/download/windows/
    echo.
    echo 2. Use Docker ^(recommended for development^):
    echo    docker run -d --name fintech-postgres ^
    echo      -e POSTGRES_DB=fintech_db ^
    echo      -e POSTGRES_USER=postgres ^
    echo      -e POSTGRES_PASSWORD=fintech_password ^
    echo      -p 5432:5432 ^
    echo      postgres:15-alpine
    echo.
    echo 3. Use a cloud database ^(production^):
    echo    - Neon ^(https://neon.tech^) - Free tier available
    echo    - Supabase ^(https://supabase.com^) - PostgreSQL with extras
    echo    - Railway ^(https://railway.app^) - Full stack deployment
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL found

REM Check if database exists
psql -h localhost -U postgres -t -c "SELECT 1 FROM pg_database WHERE datname='fintech_db'" >nul 2>&1
if errorlevel 1 (
    echo 📦 Creating database 'fintech_db'...
    createdb -h localhost -U postgres fintech_db
    if errorlevel 1 (
        echo ❌ Failed to create database. Make sure PostgreSQL service is running.
        pause
        exit /b 1
    )
    echo ✅ Database created successfully
) else (
    echo ✅ Database 'fintech_db' already exists
)

REM Navigate to backend API directory
cd ../services/backend-api

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Run database migrations
echo 🗄️ Running database migrations...
npx prisma db push
if errorlevel 1 (
    echo ❌ Failed to run migrations
    pause
    exit /b 1
)

REM Seed the database
echo 🌱 Seeding database...
npx prisma db seed
if errorlevel 1 (
    echo ⚠️ Database seeded with warnings/errors
) else (
    echo ✅ Database seeded successfully
)

echo.
echo 🎉 Database setup complete!
echo.
echo 📊 Database Details:
echo    Host: localhost
echo    Port: 5432
echo    Database: fintech_db
echo    User: postgres
echo.
echo 🔗 Connection URL:
echo    postgresql://postgres:fintech_password@localhost:5432/fintech_db
echo.
echo ✅ Your database is now ready for development!
pause

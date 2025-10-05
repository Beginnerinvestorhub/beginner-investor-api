#!/bin/bash
# Database Setup Script for Beginner Investor Hub
# This script sets up PostgreSQL database and runs Prisma migrations

set -e

echo "🚀 Setting up database for Beginner Investor Hub..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "📋 Installation options:"
    echo "1. Install PostgreSQL locally:"
    echo "   - Windows: Download from https://www.postgresql.org/download/windows/"
    echo "   - Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "   - macOS: brew install postgresql"
    echo ""
    echo "2. Use Docker (recommended for development):"
    echo "   docker run -d --name fintech-postgres \\"
    echo "     -e POSTGRES_DB=fintech_db \\"
    echo "     -e POSTGRES_USER=postgres \\"
    echo "     -e POSTGRES_PASSWORD=fintech_password \\"
    echo "     -p 5432:5432 \\"
    echo "     postgres:15-alpine"
    echo ""
    echo "3. Use a cloud database (production):"
    echo "   - Neon (https://neon.tech) - Free tier available"
    echo "   - Supabase (https://supabase.com) - PostgreSQL with extras"
    echo "   - Railway (https://railway.app) - Full stack deployment"
    echo ""
    exit 1
fi

echo "✅ PostgreSQL found"

# Check if database exists
DB_EXISTS=$(psql -h localhost -U postgres -t -c "SELECT 1 FROM pg_database WHERE datname='fintech_db'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
    echo "✅ Database 'fintech_db' already exists"
else
    echo "📦 Creating database 'fintech_db'..."
    createdb -h localhost -U postgres fintech_db
    echo "✅ Database created successfully"
fi

# Navigate to backend API directory
cd ../services/backend-api

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Seed the database
echo "🌱 Seeding database..."
npx prisma db seed

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📊 Database Details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: fintech_db"
echo "   User: postgres"
echo ""
echo "🔗 Connection URL:"
echo "   postgresql://postgres:fintech_password@localhost:5432/fintech_db"
echo ""
echo "✅ Your database is now ready for development!"

#!/bin/bash

echo "🚀 Progress.now - Quick Start Guide"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    echo "Please copy .env.example to .env.local and add your Supabase credentials"
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔍 Checking database connection..."
node -r dotenv/config -r tsx/cjs scripts/verify-connection.ts dotenv_config_path=.env.local

if [ $? -eq 0 ]; then
    echo ""
    echo "🗄️  Checking database tables..."
    node -r dotenv/config -r tsx/cjs scripts/setup-database.ts dotenv_config_path=.env.local
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "⚠️  Database migrations needed!"
        echo "Please run migrations via Supabase SQL Editor:"
        echo "  1. Go to https://app.supabase.com"
        echo "  2. SQL Editor → New Query"
        echo "  3. Run supabase/migrations/001_initial_schema.sql"
        echo "  4. Run supabase/migrations/002_row_level_security.sql"
        echo ""
        echo "After migrations, run: npm run dev"
        exit 1
    fi
fi

echo ""
echo "✅ All systems ready!"
echo ""
echo "Starting development server..."
npm run dev

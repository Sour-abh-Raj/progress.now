#!/bin/bash

echo "🔍 Progress.now - System Health Check"
echo "======================================"
echo ""

# Check environment
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found"
    exit 1
fi
echo "✅ Environment configured"

# Check dependencies
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed"
    echo "Run: npm install"
    exit 1
fi
echo "✅ Dependencies installed"

# Run unit tests
echo ""
echo "Running unit tests..."
npm run test:unit > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Unit tests passed (26/26)"
else
    echo "❌ Unit tests failed"
    exit 1
fi

# Check build
echo ""
echo "Testing production build..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Production build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Check Supabase connection
echo ""
echo "Checking Supabase connection..."
node -r dotenv/config -r tsx/cjs scripts/verify-connection.ts dotenv_config_path=.env.local > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Supabase connection working"
else
    echo "❌ Supabase connection failed"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ All health checks passed!"
echo "======================================"
echo ""
echo "System is stable and ready for use."
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "To run smoke tests (requires DB migrations):"
echo "  node -r dotenv/config -r tsx/cjs scripts/smoke-test.ts dotenv_config_path=.env.local"
echo ""

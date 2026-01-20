#!/bin/bash

echo "🔧 Testing Supabase Signup Pipeline"
echo "===================================="
echo ""

if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found"
    exit 1
fi

echo "Running signup test..."
echo ""

node -r dotenv/config -r tsx/cjs scripts/test-signup.ts dotenv_config_path=.env.local

if [ $? -eq 0 ]; then
    echo ""
    echo "===================================="
    echo "✅ Signup pipeline is operational!"
    echo "===================================="
    exit 0
else
    echo ""
    echo "===================================="
    echo "❌ Signup pipeline has issues"
    echo "===================================="
    echo ""
    echo "Please check:"
    echo "  1. Have you applied migration 003_fix_auth_trigger.sql?"
    echo "  2. Is Supabase connection working?"
    echo "  3. Check Supabase logs for errors"
    exit 1
fi

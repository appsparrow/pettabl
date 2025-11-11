#!/bin/bash
# Quick Start Script for DingDongDog Local Development

set -euo pipefail

echo "🐾 DingDongDog Local Setup"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Local Supabase Configuration (DD_dingdongdog_local)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
EOF
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🚀 Starting development server..."
echo ""
npm run dev


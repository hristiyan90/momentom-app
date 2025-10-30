#!/bin/bash

# GAP-2 Testing - Start Development Server
# This script ensures you're running the correct dev server for testing

echo "🚀 Starting Momentom App Dev Server for GAP-2 Testing"
echo "======================================================"
echo ""

# Confirm we're in the right directory
if [ ! -f "package.json" ] || ! grep -q "my-v0-project" package.json; then
    echo "❌ Error: Not in momentom-app-claude directory"
    echo "Please cd to: /Users/chris/Documents/GitHub/momentom-app-claude"
    exit 1
fi

echo "✅ Confirmed: In momentom-app-claude directory"
echo ""

# Check if port 3000 is already in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Warning: Port 3000 is already in use"
    echo ""
    echo "Currently running:"
    lsof -i :3000 | grep LISTEN
    echo ""
    read -p "Kill this process and start fresh? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔪 Killing process on port 3000..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        sleep 2
        echo "✅ Port 3000 cleared"
    else
        echo "ℹ️  Using existing server. If you have issues, restart manually."
        echo ""
        echo "To test GAP-2:"
        echo "1. Navigate to: http://localhost:3000/cockpit"
        echo "2. Look for test widget in bottom-right corner"
        echo "3. Open DevTools Console (F12) to see logs"
        exit 0
    fi
fi

# Clear Next.js cache
echo ""
echo "🧹 Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"

# Start dev server
echo ""
echo "🚀 Starting dev server..."
echo ""
echo "================================================"
echo "  Server will start on: http://localhost:3000"
echo "================================================"
echo ""
echo "📍 Test GAP-2 at: http://localhost:3000/cockpit"
echo "   (Look for floating widget in bottom-right)"
echo ""
echo "📍 Alternative: http://localhost:3000/test-session"
echo "   (Full test page with detailed view)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

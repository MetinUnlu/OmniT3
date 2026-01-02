#!/bin/sh
set -e

echo "🚀 Starting Next.js development server with auto-reload..."
echo "📁 Watching for file changes in /app/src"

# Start Next.js with explicit watch options
# Using standard dev mode (not turbo) for better Docker compatibility
exec npm run dev -- --hostname 0.0.0.0

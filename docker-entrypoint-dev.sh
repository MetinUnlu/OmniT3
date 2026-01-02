#!/bin/sh
set -e

echo "🔄 Waiting for database..."
sleep 2

echo "🔄 Setting up database schema..."
npx prisma db push --skip-generate

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database setup complete!"
echo "🚀 Starting Next.js development server with auto-reload..."
echo "📁 Watching for file changes in /app/src"

# Start Next.js with explicit watch options and hostname binding
exec npm run dev -- --hostname 0.0.0.0

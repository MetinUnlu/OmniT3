#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
yarn db:seed

echo "✅ Database setup complete!"
echo "🚀 Starting application..."

exec "$@"

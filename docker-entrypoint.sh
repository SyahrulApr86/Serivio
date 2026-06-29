#!/bin/sh
set -e

echo "Running database migrations..."
bun run /app/migrate.ts

echo "Starting Serivio..."
exec node build/index.js

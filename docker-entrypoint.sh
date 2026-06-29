#!/bin/sh
set -e

echo "Running database migrations..."
bun x drizzle-kit migrate

echo "Starting Serivio..."
exec node build/index.js

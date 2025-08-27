#!/bin/bash

# Script to build frontend locally and run with Docker
# This bypasses npm authentication issues in Docker

set -e

echo "🏗️  Building frontend locally..."
cd frontend
npm run build
cd ..

echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.local-build.yml up --build

echo "✅ Done! Frontend available at http://localhost:3000"

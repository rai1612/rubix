#!/bin/bash

# Start development services
# This runs backend in Docker and frontend locally to avoid platform issues

echo "🚀 Starting rubiX development environment..."

# Start backend services in Docker
echo "📦 Starting backend services (PostgreSQL, Redis, Backend)..."
docker-compose up -d postgres redis backend

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Start frontend locally
echo "🎨 Starting frontend locally..."
cd frontend
npm run dev

echo "✅ Development environment ready!"
echo "   🎯 Frontend: http://localhost:5173"
echo "   🔧 Backend: http://localhost:8080"
echo "   🗄️ Database: localhost:5432"

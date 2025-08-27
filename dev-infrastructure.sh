#!/bin/bash

# Start only infrastructure services (PostgreSQL and Redis) for native development
# This allows running Spring Boot and React natively for faster development

echo "🏗️  Starting rubiX infrastructure services..."

# Start only database services
echo "🗄️  Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if ! docker ps | grep -q rubix-postgres; then
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

if ! docker ps | grep -q rubix-redis; then
    echo "❌ Redis failed to start"
    exit 1
fi

echo "✅ Infrastructure services ready!"
echo ""
echo "📋 Next steps:"
echo "   1. Start backend: cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev --settings ../maven-settings-clean.xml"
echo "   2. Start frontend: cd frontend && npm run dev"
echo ""
echo "🔗 Service endpoints:"
echo "   🗄️  PostgreSQL: localhost:5432"
echo "   🔴 Redis: localhost:6379"
echo "   🎯 Frontend (when started): http://localhost:5173"
echo "   🔧 Backend (when started): http://localhost:8080"

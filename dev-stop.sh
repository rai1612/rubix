#!/bin/bash

# Stop development services

echo "🛑 Stopping rubiX development environment..."

# Stop Docker services
docker-compose down

echo "✅ Development environment stopped!"

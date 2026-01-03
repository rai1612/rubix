# rubiX - Development Commands
# Usage: make <target>

.PHONY: help dev dev-infra dev-full stop build build-no-cache logs ps \
        db-connect db-reset db-seed db-setup db-status db-validate backend-logs frontend-logs clean

# Default target - show help
help:
	@echo "rubiX Development Commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Development:"
	@echo "  dev-infra      Start infrastructure only (PostgreSQL)"
	@echo "  dev-full       Start full development environment (all services in Docker)"
	@echo "  dev            Alias for dev-infra (recommended for local development)"
	@echo "  stop           Stop all services"
	@echo "  logs           Follow logs from all containers"
	@echo "  ps             Show status of all containers"
	@echo ""
	@echo "Building:"
	@echo "  build          Build all containers"
	@echo "  build-no-cache Force rebuild without cache"
	@echo ""
	@echo "Database:"
	@echo "  db-connect     Connect to PostgreSQL database"
	@echo "  db-setup       Complete DB setup (schema + seed data)"
	@echo "  db-seed        Load seed data (users + algorithms)"
	@echo "  db-status      Show database statistics"
	@echo "  db-validate    Validate database contents"
	@echo "  db-reset       Reset database (WARNING: destroys all data)"
	@echo ""
	@echo "Logs:"
	@echo "  backend-logs   Follow backend logs only"
	@echo "  frontend-logs  Follow frontend logs only"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean          Stop containers and remove volumes"
	@echo ""
	@echo "Recommended workflow:"
	@echo "  1. make dev-infra   # Start PostgreSQL"
	@echo "  2. cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev"
	@echo "  3. cd frontend && npm run dev"

# Start infrastructure only (PostgreSQL)
# Recommended for local development - run backend and frontend natively
dev-infra:
	@echo "🏗️  Starting rubiX infrastructure services..."
	docker-compose up -d postgres
	@echo ""
	@echo "⏳ Waiting for services to be ready..."
	@sleep 3
	@echo ""
	@echo "✅ Infrastructure services ready!"
	@echo ""
	@echo "📋 Next steps:"
	@echo "   1. Start backend: cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev"
	@echo "   2. Start frontend: cd frontend && npm run dev"
	@echo ""
	@echo "🔗 Service endpoints:"
	@echo "   🗄️  PostgreSQL: localhost:5432"
	@echo "   🎯 Frontend (when started): http://localhost:5173"
	@echo "   🔧 Backend (when started): http://localhost:8080"

# Alias for dev-infra
dev: dev-infra

# Start full development environment with all services in Docker
dev-full:
	@echo "🚀 Starting rubiX full development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "✅ Development environment ready!"
	@echo "   🎯 Frontend: http://localhost:5173"
	@echo "   🔧 Backend: http://localhost:8080"
	@echo "   🗄️  Database: localhost:5432"

# Stop all services
stop:
	@echo "🛑 Stopping rubiX services..."
	docker-compose down
	docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	@echo "✅ All services stopped!"

# Build all containers
build:
	@echo "🏗️  Building containers..."
	docker-compose build
	docker-compose -f docker-compose.dev.yml build

# Force rebuild without cache
build-no-cache:
	@echo "🏗️  Rebuilding containers (no cache)..."
	docker-compose build --no-cache
	docker-compose -f docker-compose.dev.yml build --no-cache

# Follow logs from all containers
logs:
	docker-compose logs -f

# Show status of all containers
ps:
	docker-compose ps

# Connect to PostgreSQL database
db-connect:
	docker-compose exec postgres psql -U rubix -d rubix

# Complete database setup (schema + all seed data)
db-setup:
	@echo "🏗️  Complete database setup..."
	./scripts/manage-db.sh setup

# Seed database with all algorithms and users
db-seed:
	@echo "🌱 Seeding database with algorithms and users..."
	./scripts/manage-db.sh init

# Show database statistics
db-status:
	./scripts/manage-db.sh status

# Validate database contents
db-validate:
	./scripts/manage-db.sh validate

# Reset database (WARNING: destroys all data)
db-reset:
	@echo "⚠️  WARNING: This will destroy all database data!"
	@read -p "Are you sure? (y/N) " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v
	docker volume rm rubix_postgres_data 2>/dev/null || true
	docker volume rm rubix_postgres_dev_data 2>/dev/null || true
	@echo "✅ Database volumes removed. Run 'make dev' to recreate."

# Follow backend logs only
backend-logs:
	docker-compose logs -f backend

# Follow frontend logs only
frontend-logs:
	docker-compose logs -f frontend

# Stop containers and remove volumes
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
	@echo "✅ Cleanup complete!"


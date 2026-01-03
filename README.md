# rubiX - Speedcubing Practice Platform

> The most effective, delightful practice & learning platform for cubers — from absolute beginners to speedcubing competitors.

## Vision

Build a mobile-first, low-friction platform focused on measurable improvement with immediate feedback and incremental features starting with 3×3 cubes.

## Quick Start

### Prerequisites

- **Docker Desktop** (for database)
- **Node.js 18+** (for frontend)
- **Java 21** + **Maven** (for backend)

### 1. Setup Environment Variables

```bash
# Copy the environment template
cp .env.example .env

# Edit .env and set your secure values (see docs/security.md for details)
# At minimum, set these required values:
# - POSTGRES_PASSWORD
# - SPRING_DATASOURCE_PASSWORD  
# - JWT_SECRET (generate with: openssl rand -hex 32)
```

### 2. Development Setup

**Option A: Infrastructure only (recommended)**

```bash
# Start PostgreSQL
make dev

# In a new terminal - start backend
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# In another terminal - start frontend
cd frontend
npm install
npm run dev
```

**Option B: Full Docker environment**

```bash
make dev-full
```

### Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

### Useful Commands

```bash
make help          # Show all available commands
make dev           # Start infrastructure (PostgreSQL)
make dev-full      # Start all services in Docker
make stop          # Stop all services
make logs          # Follow container logs
make db-connect    # Connect to PostgreSQL
```

> **⚠️ Security Note**: See [docs/security.md](./docs/security.md) for detailed security configuration.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Java Spring Boot + Maven
- **Database**: PostgreSQL
- **3D Visualization**: Three.js
- **Auth**: Spring Security + JWT + OAuth2

## Project Structure

```
rubiX/
├── frontend/              # React + TypeScript + Vite
├── backend/               # Spring Boot + Maven
├── docs/                  # Documentation
│   ├── development.md     # Development guide
│   ├── security.md        # Security configuration
│   ├── features/          # Feature documentation
│   ├── architecture/      # Architecture decisions
│   └── database/          # Database documentation
├── scripts/               # Database management scripts
├── docker-compose.yml     # Production configuration
├── docker-compose.dev.yml # Development configuration
└── Makefile               # Development commands
```

## Documentation

- [Development Guide](./docs/development.md) - Commands, workflows, troubleshooting
- [Security Guide](./docs/security.md) - Security configuration and best practices
- [Feature Docs](./docs/features/) - Feature implementation details

## MVP Features (12-week roadmap)

1. ✅ User accounts & profile (email + OAuth)
2. ✅ Timer + Session logging
3. ✅ Official scramble generator (3×3)
4. ✅ Basic statistics & visualizations
5. ✅ Algorithm library
6. ✅ Practice modes
7. ⏳ Minimal 3D visualizer
8. ⏳ Progression/goals UI
9. ⏳ PWA + offline caching

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

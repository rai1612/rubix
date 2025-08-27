# rubiX - Speedcubing Practice Platform

> The most effective, delightful practice & learning platform for cubers — from absolute beginners to speedcubing competitors.

## Vision
Build a mobile-first, low-friction platform focused on measurable improvement with immediate feedback and incremental features starting with 3×3 cubes.

## Quick Start

### Prerequisites

1. **Setup Environment Variables**
   ```bash
   # Copy the environment template
   cp env.example .env
   
   # Edit .env and set your secure values (see SECURITY.md for details)
   # At minimum, set these required values:
   # - POSTGRES_PASSWORD
   # - SPRING_DATASOURCE_PASSWORD  
   # - JWT_SECRET
   ```

### Development Setup

```bash
# Start infrastructure only (recommended for development)
./dev-infrastructure.sh

# Start backend (Spring Boot) - in new terminal
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Start frontend (React + Vite) - in new terminal
cd frontend
npm install
npm run dev
```

### Docker Setup
```bash
# Make sure .env is configured first!
docker-compose up -d
```

> **⚠️ Security Note**: See [SECURITY.md](./SECURITY.md) for detailed security configuration instructions.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Java Spring Boot + Maven
- **Database**: PostgreSQL + Redis
- **3D Visualization**: Three.js/react-three-fiber
- **Auth**: Spring Security + JWT + OAuth2

## MVP Features (12-week roadmap)

1. ✅ User accounts & profile (email + OAuth)
2. 🚧 Timer + Session logging
3. 🚧 Official scramble generator (3×3)
4. ⏳ Basic statistics & visualizations
5. ⏳ Algorithm library
6. ⏳ Practice modes
7. ⏳ Minimal 3D visualizer
8. ⏳ Progression/goals UI
9. ⏳ PWA + offline caching

## Project Structure

```
rubiX/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Spring Boot + Maven
├── docker-compose.yml # Local development
├── .github/           # CI/CD workflows
└── docs/              # Architecture & API docs
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

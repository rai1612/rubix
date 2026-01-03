# rubiX - Speedcubing Practice Platform

A modern web application for Rubik's cube enthusiasts to practice algorithms, track solve times, and improve their speedcubing skills.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Spring Boot 3.2, Java 21, PostgreSQL
- **Authentication**: JWT with OAuth2 (Google, GitHub)

## Features

- Timer with inspection time and penalties (DNF, +2)
- Session management for organizing practice
- OLL, PLL, F2L algorithm database with images
- Statistics and performance tracking
- 3D Cube Visualizer

## Deployment

### Database (Neon)
Run SQL files in order:
1. `scripts/db/schema/001_initial_schema.sql`
2. `scripts/db/seeds/users/demo_users.sql`
3. `scripts/db/seeds/algorithms/*.sql`

### Backend (Render)
- Runtime: Java 21
- Build: `mvn clean install -DskipTests`
- Start: `java -jar target/rubix-backend-0.1.0.jar`

### Frontend (Vercel)
- Framework: Vite
- Build: `npm run build`
- Output: `dist`

## Environment Variables

### Backend
```
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
JWT_SECRET=...
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend
```
VITE_API_URL=https://your-backend.onrender.com
```

## Local Development

```bash
# Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# Backend
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
cd frontend && npm install && npm run dev
```


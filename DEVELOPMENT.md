# 🚀 RubiX Development Command Reference

Quick reference guide for developing with the RubiX containerized application.

## 📋 Essential Commands

### Starting & Stopping
```bash
# Start all services for development
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove everything (including volumes - DESTROYS DATA!)
docker-compose down -v
```

### Building & Restarting
```bash
# Rebuild and restart specific service
docker-compose up --build frontend -d
docker-compose up --build backend -d

# Force rebuild (no cache)
docker-compose build --no-cache frontend
docker-compose build --no-cache backend

# Rebuild everything
docker-compose build
```

### Monitoring & Debugging
```bash
# Check status of all containers
docker-compose ps

# View real-time logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# Get shell access inside containers
docker-compose exec frontend sh
docker-compose exec backend bash
docker-compose exec postgres bash
```

## 🌐 Application URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React app (development) |
| Backend | http://localhost:8080 | Spring Boot API |
| Database | localhost:5432 | PostgreSQL |
| Cache | localhost:6379 | Redis |

## 📂 Development Workflow

### Making Changes

#### Frontend Changes
```bash
# Just edit files in frontend/src/ - hot reload works automatically!
# No commands needed for most changes

# If you add new dependencies to package.json:
docker-compose build frontend
docker-compose up frontend -d
```

#### Backend Changes
```bash
# Edit files in backend/src/

# For Java code changes:
docker-compose up --build backend -d

# For dependency changes in pom.xml:
docker-compose build --no-cache backend
docker-compose up backend -d
```

#### Database Schema Changes
```bash
# Edit backend/src/main/resources/db/schema.sql or data.sql

# Then reset database:
docker-compose down
docker volume rm rubix_postgres_dev_data
docker-compose up -d
```

## 🗃️ Database Commands

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U rubix -d rubix

# Quick database test
docker-compose exec postgres psql -U rubix -d rubix -c "SELECT 1;"

# Backup database
docker-compose exec postgres pg_dump -U rubix rubix > backup.sql

# View database logs
docker-compose logs postgres

# Reset database (WARNING: destroys all data)
docker-compose down
docker volume rm rubix_postgres_dev_data rubix_redis_dev_data
docker-compose up -d
```

## 🐛 Troubleshooting Commands

### Container Issues
```bash
# Check what's running
docker-compose ps

# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# Stop and start specific service
docker-compose stop frontend
docker-compose start frontend

# Remove and recreate specific service
docker-compose rm -f frontend
docker-compose up frontend -d
```

### Port Conflicts
```bash
# Check what's using a port
lsof -i :5173  # Frontend
lsof -i :8080  # Backend
lsof -i :5432  # Database

# Kill process using port (replace PID)
kill -9 <PID>
```

### Clean Up & Reset
```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Nuclear option - clean everything Docker related
docker system prune -a --volumes
```

## 📱 Daily Development Routine

### 🌅 Starting Development
```bash
cd /Users/arunkumarrai/Code/my-projects/rubiX
docker-compose up -d
docker-compose ps  # Verify everything is running
```

### 🔧 During Development
```bash
# Monitor logs in separate terminal
docker-compose logs -f

# Check container health anytime
docker-compose ps

# Quick restart if needed
docker-compose restart frontend
```

### 🌙 Ending Development
```bash
# Stop everything (keeps data)
docker-compose down

# Or keep running in background for faster startup tomorrow
# (just close terminal)
```

## 🚨 Emergency Commands

### Application Won't Start
```bash
# Force clean restart
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use
```bash
# Stop other Docker containers
docker stop $(docker ps -q)

# Or restart Docker Desktop entirely
```

### Database Connection Failed
```bash
# Check database container
docker-compose logs postgres

# Reset database
docker-compose down
docker volume rm rubix_postgres_dev_data
docker-compose up postgres -d
```

### Frontend Build Errors
```bash
# Clear and rebuild
docker-compose down
docker-compose build --no-cache frontend
docker-compose up frontend -d
```

## 💡 Pro Tips

- **Keep logs running**: Always have `docker-compose logs -f` in a separate terminal
- **Check status frequently**: Use `docker-compose ps` to verify container health
- **Browser refresh**: Frontend hot reload usually works, but refresh browser if needed
- **Data persistence**: Database data survives `docker-compose down` but not `docker-compose down -v`
- **Performance**: If containers are slow, allocate more resources to Docker Desktop

## 🔧 Useful One-Liners

```bash
# Quick health check
docker-compose ps && curl -s http://localhost:8080/actuator/health

# View all container resource usage
docker stats $(docker-compose ps -q)

# Follow logs from multiple services
docker-compose logs -f frontend backend

# Restart everything quickly
docker-compose down && docker-compose up -d

# Check if frontend is responding
curl -s http://localhost:5173 > /dev/null && echo "Frontend OK" || echo "Frontend DOWN"

# Check if backend is responding
curl -s http://localhost:8080/actuator/health > /dev/null && echo "Backend OK" || echo "Backend DOWN"
```

---

## 📞 Need Help?

- Check logs first: `docker-compose logs -f`
- Verify containers are running: `docker-compose ps`
- Try restarting the problematic service: `docker-compose restart [service-name]`
- When in doubt, restart everything: `docker-compose down && docker-compose up -d`

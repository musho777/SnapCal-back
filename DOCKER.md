# Docker Setup Guide

This guide explains how to run SnapCal Backend using Docker.

## Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)

## Quick Start

### 1. Development Mode

Run the app with hot-reload for development:

```bash
# Use existing database configuration
docker-compose up postgres

# Run app locally with npm
npm run start:dev
```

### 2. Production Mode

Run the entire stack in production:

```bash
# Copy and configure environment variables
cp .env.docker .env.production
# Edit .env.production with your settings

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Docker Commands

### Build the application image

```bash
docker-compose build app
```

### Start services

```bash
# Start in foreground
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Start specific service
docker-compose up postgres
```

### Stop services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Execute commands in containers

```bash
# Access app container shell
docker-compose exec app sh

# Access database
docker-compose exec postgres psql -U postgres -d nutrition_tracker

# Run migrations
docker-compose exec app npm run migration:run
```

## Configuration

### Environment Variables

All environment variables can be configured in:
- `.env` - Local development
- `.env.production` - Production deployment
- `docker-compose.yml` - Docker-specific overrides

### Database Access

When running with Docker Compose:
- **Host:** `postgres` (from app container) or `localhost` (from host machine)
- **Port:** `5432`
- **Database:** `nutrition_tracker`
- **Username:** `postgres`
- **Password:** Set in `.env`

### Ports

- **Application:** `http://localhost:3000`
- **Swagger Docs:** `http://localhost:3000/api/docs`
- **Health Check:** `http://localhost:3000/api/health`
- **PostgreSQL:** `localhost:5432`

## Production Deployment

### 1. Security Checklist

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Configure proper `CORS_ORIGIN` (not `*`)
- [ ] Set `DB_SYNC=false` to prevent automatic schema changes
- [ ] Use HTTPS/SSL for all connections
- [ ] Set up proper backup strategy for PostgreSQL

### 2. Build for Production

```bash
# Build optimized image
docker-compose build --no-cache app

# Tag for registry
docker tag snapcal-backend:latest your-registry.com/snapcal-backend:1.0.0

# Push to registry
docker push your-registry.com/snapcal-backend:1.0.0
```

### 3. Deploy to Server

```bash
# On production server
docker-compose -f docker-compose.yml up -d

# Check health
curl http://localhost:3000/api/health
```

## Troubleshooting

### App can't connect to database

**Problem:** `ECONNREFUSED` error

**Solution:**
```bash
# Check if postgres is running
docker-compose ps

# Check postgres logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Port already in use

**Problem:** `Port 3000 is already allocated`

**Solution:**
```bash
# Stop conflicting services
lsof -ti:3000 | xargs kill

# Or change port in .env
PORT=3001
```

### Database data persists after `down`

**Problem:** Old data remains after restart

**Solution:**
```bash
# Remove volumes to reset database
docker-compose down -v
docker-compose up -d
```

### Permission errors

**Problem:** Permission denied errors

**Solution:**
```bash
# Fix file permissions
chmod -R 755 ./certs

# Rebuild with correct user
docker-compose build --no-cache
```

## Advanced

### Custom Dockerfile

Modify `Dockerfile` for custom requirements:

```dockerfile
# Add system dependencies
RUN apk add --no-cache python3 make g++

# Add build arguments
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine
```

### Multi-stage Builds

The Dockerfile uses multi-stage builds:
- **Builder stage:** Compiles TypeScript
- **Production stage:** Minimal runtime image

### Health Checks

The container includes automatic health checks:
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3

Check health status:
```bash
docker inspect snapcal-backend | jq '.[0].State.Health'
```

## Performance Optimization

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Database Tuning

For production, tune PostgreSQL in `docker-compose.yml`:

```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "max_connections=200"
    - "-c"
    - "shared_buffers=256MB"
```

## Monitoring

### Docker Stats

```bash
# Real-time resource usage
docker stats snapcal-backend snapcal-postgres

# Container health
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Application Logs

```bash
# Follow logs
docker-compose logs -f --tail=100 app

# Export logs
docker-compose logs app > app.log
```

## Backup & Restore

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres nutrition_tracker > backup.sql

# Or use volume backup
docker run --rm -v snapcal-back_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz -C /data .
```

### Restore Database

```bash
# From SQL dump
docker-compose exec -T postgres psql -U postgres nutrition_tracker < backup.sql

# From volume backup
docker run --rm -v snapcal-back_postgres_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres-backup.tar.gz -C /data
```

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Inspect containers: `docker-compose ps`
- Health check: `curl http://localhost:3000/api/health`

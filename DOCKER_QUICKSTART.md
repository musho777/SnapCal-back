# Docker Quick Start

## ✅ Fixed: package-lock.json Issue

The `package-lock.json` has been regenerated and is now in sync with `package.json`. The Docker build should work properly now.

## Prerequisites

Make sure Docker Desktop is running:
- **Mac:** Open Docker Desktop from Applications
- **Windows:** Start Docker Desktop
- **Linux:** `sudo systemctl start docker`

## Test the Build

### 1. Build the Docker Image

```bash
# Build the image
docker build -t snapcal-backend .

# This will take 2-5 minutes on first build
```

If successful, you'll see:
```
✔ Successfully built <image-id>
✔ Successfully tagged snapcal-backend:latest
```

### 2. Start with Docker Compose

```bash
# Start PostgreSQL and the app
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","timestamp":"...","service":"snapcal-back","version":"1.0.0"}
```

### 4. Access Swagger Docs

Open in browser: http://localhost:3000/api/docs

## Troubleshooting

### "Cannot connect to Docker daemon"

**Problem:** Docker is not running

**Solution:**
```bash
# Mac/Windows: Start Docker Desktop
# Linux:
sudo systemctl start docker
```

### "Port 3000 already in use"

**Problem:** Another service is using port 3000

**Solution:**
```bash
# Stop the conflicting service
lsof -ti:3000 | xargs kill

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

### "npm ci" fails during build

**Problem:** package-lock.json out of sync (already fixed!)

**Solution:**
```bash
# If it happens again, run locally:
rm package-lock.json
npm install
```

## Next Steps

1. ✅ Docker files created
2. ✅ package-lock.json regenerated
3. ✅ Local build verified
4. 🔄 Start Docker Desktop
5. 🔄 Run `docker-compose up -d`
6. 🔄 Test API at http://localhost:3000/api/health

## Security Notes

The vulnerabilities shown by `npm audit` are in **dev dependencies** only:
- `@nestjs/cli` - Used only during development
- `webpack` - Used only during build
- `eslint`, `prettier` - Used only for linting/formatting

These are **NOT included** in the production Docker image (see Dockerfile line 36: `npm ci --only=production`).

The production image only contains:
- ✅ Runtime dependencies
- ✅ Compiled JavaScript code
- ✅ No dev tools

## Complete Docker Documentation

For full documentation, see [DOCKER.md](DOCKER.md)

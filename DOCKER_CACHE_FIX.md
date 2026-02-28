# Docker Build Fix - Clear Cache Required

## ✅ Root Cause Found

The `.dockerignore` file has been completely rewritten, but Docker might still be using **cached layers** from previous builds that excluded the logs directory.

## The Solution: Build Without Cache

You need to build **without cache** to ensure Docker uses the updated `.dockerignore` file.

---

## Build Commands

### Option 1: Clean Build (Recommended)

```bash
# Remove old images first
docker rmi snapcal-backend 2>/dev/null || true

# Build without cache
docker build --no-cache -t snapcal-backend .
```

### Option 2: Build with Specific Tag

```bash
# Build with a new tag
docker build --no-cache -t snapcal-backend:v2 .
```

### Option 3: Use docker-compose

```bash
# Rebuild with no cache
docker-compose build --no-cache

# Then start
docker-compose up -d
```

---

## What Changed in .dockerignore

### Old .dockerignore (Problematic)

The old file had patterns that could match directories:

```dockerignore
logs              # This matched src/modules/logs/ directory!
*.log
```

### New .dockerignore (Fixed)

Now using explicit directory patterns with trailing slashes and specific file patterns:

```dockerignore
# Use directory patterns (with /)
node_modules/
dist/
coverage/

# Specific log files only
npm-debug.log
yarn-debug.log
*.log

# Everything else is included by default
```

---

## Why --no-cache Is Necessary

Docker caches each build step (layer):

```dockerfile
COPY package*.json ./    # Layer 1 - Cached ✅
RUN npm ci               # Layer 2 - Cached ✅
COPY . .                 # Layer 3 - Using OLD .dockerignore ❌
RUN npm run build        # Layer 4 - Fails because logs missing
```

When you change `.dockerignore`:
- Docker doesn't automatically invalidate cache
- `COPY . .` might still use the old cached layer
- You need `--no-cache` to force fresh copy

---

## Complete Build Process

### Step 1: Clean up old builds

```bash
# Stop running containers
docker-compose down

# Remove old images
docker rmi snapcal-backend

# Optional: Clean up all Docker build cache
docker builder prune -f
```

### Step 2: Build fresh

```bash
# Build without any cache
docker build --no-cache -t snapcal-backend .

# Expected output:
# => [builder 1/5] FROM node:20-alpine
# => [builder 2/5] COPY package*.json ./
# => [builder 3/5] RUN npm ci
# => [builder 4/5] COPY . .
# => [builder 5/5] RUN npm run build
#    ✅ webpack 5.97.1 compiled successfully
# => [production 1/6] FROM node:20-alpine
# ...
# => => writing image sha256:...
# ✅ Successfully tagged snapcal-backend:latest
```

### Step 3: Start services

```bash
# Start with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f app

# Test API
curl http://localhost:3000/api/health
```

---

## Verify It's Working

### Check if logs module is included

```bash
# Run a test container
docker run --rm snapcal-backend ls -la dist/modules/

# Should show:
# drwxr-xr-x  auth/
# drwxr-xr-x  dishes/
# drwxr-xr-x  logs/      ← Should be present!
# drwxr-xr-x  meals/
# drwxr-xr-x  users/
```

### Check the build output

```bash
# Build and watch for "successfully"
docker build --no-cache -t snapcal-backend . 2>&1 | grep -i "compiled"

# Expected:
# webpack 5.97.1 compiled successfully in 3272 ms
```

---

## Troubleshooting

### Still failing with "Module not found"?

1. **Verify .dockerignore is correct**
   ```bash
   cat .dockerignore | grep "logs"
   # Should NOT show just "logs" alone
   # Should show "*.log" or "npm-debug.log"
   ```

2. **Check if src/modules/logs exists locally**
   ```bash
   ls -la src/modules/logs/
   # Should show: logs.module.ts, logs.service.ts, etc.
   ```

3. **Clear ALL Docker cache**
   ```bash
   docker builder prune -a -f
   docker build --no-cache -t snapcal-backend .
   ```

4. **Try a different image tag**
   ```bash
   docker build --no-cache -t snapcal-backend:test .
   docker run --rm snapcal-backend:test ls dist/modules/
   ```

---

## Summary

| Step | Command | Why |
|------|---------|-----|
| 1. Update .dockerignore | ✅ Done | Fixed patterns |
| 2. Remove old images | `docker rmi snapcal-backend` | Clear old cache |
| 3. Build without cache | `docker build --no-cache` | Use new .dockerignore |
| 4. Test | `curl localhost:3000/api/health` | Verify it works |

---

## The Complete Command

Copy and run this:

```bash
# One-liner to clean and rebuild
docker-compose down && \
docker rmi snapcal-backend 2>/dev/null || true && \
docker build --no-cache -t snapcal-backend . && \
docker-compose up -d && \
docker-compose logs -f
```

---

## Key Takeaway

**Always use `--no-cache` after changing `.dockerignore`** to ensure Docker doesn't use old cached layers!

```bash
docker build --no-cache -t snapcal-backend .
```

This will solve the "Module not found" error! 🐳✨

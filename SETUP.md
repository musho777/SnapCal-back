# Setup Guide - Nutrition Tracker API

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nutrition_tracker;

# Exit psql
\q
```

### 3. Environment Configuration

Copy the development environment file:

```bash
cp .env.development .env
```

Update the `.env` file with your configuration:

- Database credentials (DB_USERNAME, DB_PASSWORD)
- JWT secrets (use strong random strings in production)
- OAuth credentials (if using OAuth providers)

### 4. Run Migrations

Run the database migrations to create all tables:

```bash
npm run migration:run
```

### 5. Seed Database (Optional)

Seed the database with sample categories and dishes:

```bash
npm run seed
```

### 6. Start the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The API will be available at:
- API: `http://localhost:3000/api/v1`
- Swagger Docs: `http://localhost:3000/api/v1/docs`

## OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/v1/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Apple OAuth

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID
3. Create a Services ID
4. Configure Sign in with Apple
5. Download private key (.p8 file) and save to `certs/` directory
6. Update `.env` with Team ID, Key ID, and Client ID

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URI: `http://localhost:3000/api/v1/auth/facebook/callback`
5. Copy App ID and App Secret to `.env`

## Testing the API

### Health Check

```bash
curl http://localhost:3000/api/v1
```

### Create Guest Session

```bash
curl -X POST http://localhost:3000/api/v1/guest/session \
  -H "Content-Type: application/json" \
  -d '{"device_id": "test-device"}'
```

### Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

## Database Migrations

### Generate New Migration

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

## Background Jobs

Background jobs run automatically:

- **Guest session cleanup**: Daily at 2:00 AM
- **Daily statistics aggregation**: Daily at 1:00 AM
- **Dish ratings update**: Every 6 hours

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running: `pg_isready`
2. Check database credentials in `.env`
3. Ensure database exists: `psql -U postgres -l`

### Migration Errors

If migrations fail:
```bash
# Revert all migrations
npm run migration:revert

# Run migrations again
npm run migration:run
```

### OAuth Callback Issues

- Ensure callback URLs match exactly in provider settings
- Check CORS settings in `.env`
- Verify SSL certificates for production

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use strong JWT secrets
3. Enable SSL/TLS for database connections
4. Set `DB_SYNC=false` (always use migrations)
5. Configure proper CORS origins
6. Use environment-specific OAuth callback URLs
7. Set up proper logging and monitoring

## Next Steps

- Explore the Swagger documentation at `/api/v1/docs`
- Test all API endpoints using Postman or similar tools
- Customize business logic as needed
- Add additional features or modules
- Set up CI/CD pipeline for automated deployments

For detailed API documentation, visit the Swagger UI when the server is running.

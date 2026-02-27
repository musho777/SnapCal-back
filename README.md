# Nutrition Tracker API

A comprehensive nutrition tracking backend API built with NestJS, PostgreSQL, and TypeORM.

## Features

- 🔐 **Authentication**: JWT-based auth with support for Email/Password, Google, Apple, and Facebook OAuth
- 👤 **User Management**: Guest and registered user support with seamless upgrade path
- 🍽️ **Dish Management**: Complete dish catalog with nutrition information, categories, and ingredients
- 📊 **Daily Tracking**: Snapshot-based logging system for meals and calories
- 🎯 **Calorie Targets**: Smart target system with snapshot fallback logic
- 📈 **Body Measurements**: Track weight and height history
- ⭐ **Ratings & Preferences**: Dish ratings and dietary preferences
- ⚡ **Performance Optimized**: Database indexes and efficient queries
- 🔄 **Background Jobs**: Automated cleanup and aggregation tasks

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM 0.3.x
- **Authentication**: Passport.js + JWT
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI

## Architecture

Following **Modular Clean Architecture** with these modules:

- `auth` - Authentication and authorization
- `users` - User management and profiles
- `guest` - Guest session handling
- `dishes` - Dish catalog and management
- `logs` - Daily calorie logging
- `meals` - Meal tracking (breakfast, lunch, dinner)
- `settings` - User settings and calorie targets
- `ratings` - Dish ratings
- `diet-preferences` - Dietary preferences

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials and OAuth keys
```

### Database Setup

```bash
# Run migrations
npm run migration:run

# Seed database (optional)
npm run seed
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api/v1`

## API Documentation

Swagger documentation is available at: `http://localhost:3000/api/docs`

## Database Schema

### Core Entities

- **users** - User accounts
- **user_profiles** - User profile information
- **user_oauth_accounts** - OAuth provider accounts
- **guest_sessions** - Guest user sessions
- **user_settings** - User preferences
- **user_calorie_targets** - Calorie target snapshots
- **user_daily_logs** - Daily tracking logs
- **meals** - Meal records (breakfast, lunch, dinner)
- **meal_dishes** - Many-to-many meal-dish relation
- **dishes** - Dish catalog
- **dish_categories** - Dish categorization
- **dish_ingredients** - Dish ingredients
- **dish_cooking_steps** - Cooking instructions
- **dish_ratings** - User ratings for dishes
- **body_measurements** - Weight and height tracking
- **diet_preferences** - Dietary preferences

## Key Features Explained

### Guest Mode

Users can start using the app without registration. A guest token is generated and stored in `guest_sessions`. Later, they can upgrade to a registered account.

### Snapshot-Based Logging

The daily log system uses snapshots to capture state at a point in time. Calorie targets also use snapshots with fallback logic to the latest previous target.

### Meal Processing

When a dish is added to a meal:
1. Find or create daily log for user + date
2. Find or create meal by type (breakfast/lunch/dinner)
3. Add dish to meal_dishes
4. Recalculate meal totals
5. Update daily log calories_consumed

### Calorie Target Fallback

```sql
SELECT target_calories
FROM user_calorie_targets
WHERE user_id = ? AND target_date <= CURRENT_DATE
ORDER BY target_date DESC
LIMIT 1
```

## Scripts

```bash
# Development
npm run start:dev

# Build
npm run build

# Migrations
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run
npm run migration:revert

# Testing
npm run test
npm run test:e2e
npm run test:cov

# Linting
npm run lint
npm run format
```

## Environment Variables

See `.env.example` for all required environment variables.

## Performance Optimization

Indexes are created on:
- `users.email`
- `user_daily_logs(user_id, log_date)`
- `meal_dishes(meal_id)`
- `guest_sessions(guest_token)`
- `dish_ratings(dish_id)`

## Background Jobs

Scheduled tasks using `@nestjs/schedule`:
- Cleanup expired guest sessions (daily at 2 AM)
- Aggregate statistics
- Data maintenance

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- OAuth 2.0 for third-party auth
- Input validation on all endpoints
- SQL injection prevention via TypeORM

## License

MIT

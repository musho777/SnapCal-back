# Nutrition Tracker API - Complete Project Overview

## Project Summary

A comprehensive, production-ready NestJS backend API for nutrition tracking with support for guest users, registered users, OAuth authentication, meal tracking, and calorie management.

## Architecture

**Pattern**: Modular Clean Architecture
**Framework**: NestJS 10.x
**Database**: PostgreSQL 14+ with TypeORM
**Authentication**: JWT + OAuth (Google, Apple, Facebook)

## Project Structure

```
nutrition-tracker-api/
├── src/
│   ├── modules/                    # Feature modules
│   │   ├── auth/                   # Authentication & JWT
│   │   │   ├── strategies/         # Passport strategies
│   │   │   ├── guards/             # Auth guards
│   │   │   ├── dto/               # Data transfer objects
│   │   │   ├── interfaces/        # TypeScript interfaces
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.module.ts
│   │   ├── guest/                  # Guest session management
│   │   ├── users/                  # User profiles & body measurements
│   │   ├── settings/               # User settings & calorie targets
│   │   ├── dishes/                 # Dish catalog & management
│   │   ├── meals/                  # Meal tracking with processing algorithm
│   │   ├── logs/                   # Daily logs with snapshot system
│   │   ├── ratings/                # Dish rating system
│   │   └── diet-preferences/       # Dietary preferences
│   ├── common/                     # Shared resources
│   │   ├── enums/                  # TypeScript enums
│   │   ├── decorators/             # Custom decorators
│   │   └── tasks/                  # Background jobs
│   ├── config/                     # Configuration
│   │   └── database/               # Database config & data source
│   ├── database/                   # Database files
│   │   ├── migrations/             # TypeORM migrations
│   │   └── seeds/                  # Seed data
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   └── main.ts                    # Application entry point
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── .env.example                    # Environment template
├── .env.development                # Development environment
├── README.md                       # Main documentation
├── SETUP.md                        # Setup instructions
└── PROJECT_OVERVIEW.md             # This file
```

## Core Features

### 1. Authentication System
- **Email/Password**: Traditional registration and login
- **OAuth Providers**: Google, Apple, Facebook
- **JWT Tokens**: Access and refresh tokens
- **Guards**: Route protection with passport.js

**Files**: `src/modules/auth/*`

### 2. Guest User System
- Create anonymous sessions with device tracking
- Seamless upgrade to registered account
- Token-based identification
- Automatic cleanup of expired sessions

**Files**: `src/modules/guest/*`

### 3. User Management
- User profiles with personal information
- Body measurement tracking (weight, height)
- User settings management
- OAuth account linking

**Files**: `src/modules/users/*`

### 4. Calorie Target System ⭐
- **Snapshot-based targets**: Store calorie goals by date
- **Smart fallback logic**: Automatically use latest previous target
- Support for macro targets (protein, carbs, fats)
- SQL-optimized queries

**Implementation**:
```typescript
// Fallback to latest previous target
SELECT target_calories
FROM user_calorie_targets
WHERE user_id = ? AND target_date <= CURRENT_DATE
ORDER BY target_date DESC
LIMIT 1
```

**Files**: `src/modules/settings/*`

### 5. Daily Logging System ⭐
- **Snapshot-based logs**: Unique per user per day
- Track calories consumed and burned
- Automatic macro calculation
- Water intake tracking
- Daily notes

**Files**: `src/modules/logs/*`

### 6. Meal Processing Algorithm ⭐

**Core Algorithm**:
```
When user adds dish to meal:
1. Find daily log by user_id + date (create if not exists)
2. Find or create meal by daily_log_id + meal_type
3. Insert dish into meal_dishes with nutrition snapshot
4. Recalculate meal total calories
5. Update daily log calories_consumed
```

**Key Features**:
- Nutrition values stored as snapshots (immutable)
- Real-time recalculation of totals
- Support for multiple servings
- Meal types: breakfast, lunch, dinner

**Files**: `src/modules/meals/*`

### 7. Dish Catalog
- Complete dish database
- Categories and tags
- Ingredients with quantities
- Cooking steps with instructions
- User-created and public dishes
- Search functionality

**Files**: `src/modules/dishes/*`

### 8. Rating System
- User ratings for dishes (1-5 stars)
- Reviews and comments
- Automatic average calculation
- Rating count tracking

**Files**: `src/modules/ratings/*`

### 9. Diet Preferences
- Dietary restrictions tracking
- Allergen management
- Custom preference types

**Files**: `src/modules/diet-preferences/*`

### 10. Background Jobs
- Daily guest session cleanup (2 AM)
- Statistics aggregation (1 AM)
- Dish rating updates (every 6 hours)
- Scheduled with @nestjs/schedule

**Files**: `src/common/tasks/*`

## Database Schema

### Core Tables

1. **users** - User accounts
2. **user_profiles** - Profile information
3. **user_oauth_accounts** - OAuth provider data
4. **guest_sessions** - Anonymous sessions
5. **user_settings** - User preferences
6. **user_calorie_targets** - Calorie goal snapshots ⭐
7. **user_daily_logs** - Daily tracking logs ⭐
8. **meals** - Meal records (breakfast/lunch/dinner)
9. **meal_dishes** - Meal-dish many-to-many with nutrition snapshots ⭐
10. **dishes** - Dish catalog
11. **dish_categories** - Dish categorization
12. **dish_ingredients** - Ingredients list
13. **dish_cooking_steps** - Cooking instructions
14. **dish_ratings** - User ratings
15. **body_measurements** - Weight/height tracking
16. **diet_preferences** - Dietary preferences

### Enums

- `gender_enum`: male, female, other
- `goal_enum`: lose_weight, maintain_weight, gain_weight
- `activity_level_enum`: sedentary, light, moderate, very, extra
- `meal_type_enum`: breakfast, lunch, dinner
- `auth_provider_enum`: guest, email, google, apple, facebook

### Performance Indexes

```sql
-- User lookup
CREATE INDEX idx_users_email ON users(email);

-- Daily logs (most queried)
CREATE INDEX idx_daily_logs_user_date ON user_daily_logs(user_id, log_date);

-- Meal dishes
CREATE INDEX idx_meal_dishes_meal ON meal_dishes(meal_id);

-- Guest sessions
CREATE INDEX idx_guest_sessions_token ON guest_sessions(guest_token);

-- Ratings
CREATE INDEX idx_dish_ratings_dish ON dish_ratings(dish_id);

-- Calorie targets
CREATE INDEX idx_calorie_targets_user_date ON user_calorie_targets(user_id, target_date);
```

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
GET    /api/v1/auth/google
GET    /api/v1/auth/google/callback
GET    /api/v1/auth/apple
GET    /api/v1/auth/apple/callback
GET    /api/v1/auth/facebook
GET    /api/v1/auth/facebook/callback
```

### Guest
```
POST   /api/v1/guest/session
POST   /api/v1/guest/convert
```

### Users
```
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
GET    /api/v1/users/measurements
POST   /api/v1/users/measurements
DELETE /api/v1/users/measurements/:id
```

### Settings
```
GET    /api/v1/settings
PUT    /api/v1/settings
GET    /api/v1/settings/calorie-target/current
GET    /api/v1/settings/calorie-targets
POST   /api/v1/settings/calorie-targets
DELETE /api/v1/settings/calorie-targets/:id
```

### Dishes
```
GET    /api/v1/dishes
GET    /api/v1/dishes/search?q=
GET    /api/v1/dishes/categories
GET    /api/v1/dishes/:id
POST   /api/v1/dishes
PUT    /api/v1/dishes/:id
DELETE /api/v1/dishes/:id
POST   /api/v1/dishes/:id/ingredients
POST   /api/v1/dishes/:id/cooking-steps
```

### Meals
```
POST   /api/v1/meals/add-dish
DELETE /api/v1/meals/dish/:mealDishId
GET    /api/v1/meals/:id
```

### Logs
```
GET    /api/v1/logs/daily?date=
GET    /api/v1/logs/range?start_date=&end_date=
PUT    /api/v1/logs/daily/:date
```

### Ratings
```
POST   /api/v1/ratings
GET    /api/v1/ratings/my-ratings
GET    /api/v1/ratings/dish/:dishId
PUT    /api/v1/ratings/:id
DELETE /api/v1/ratings/:id
```

### Diet Preferences
```
GET    /api/v1/diet-preferences
POST   /api/v1/diet-preferences
DELETE /api/v1/diet-preferences/:id
```

## Key Algorithms Explained

### 1. Calorie Target Fallback
```typescript
// Get target for specific date, fallback to latest previous
async getCurrentCalorieTarget(userId: string, date?: string) {
  const target = await calorieTargetRepository.findOne({
    where: {
      user_id: userId,
      target_date: LessThanOrEqual(targetDate)
    },
    order: { target_date: 'DESC' }
  });

  return target || DEFAULT_TARGET;
}
```

### 2. Meal Processing
```typescript
async addDishToMeal(userId, { dish_id, meal_type, date, servings }) {
  // 1. Find or create daily log
  const dailyLog = await findOrCreateDailyLog(userId, date);

  // 2. Find or create meal
  const meal = await findOrCreateMeal(dailyLog.id, meal_type);

  // 3. Get dish nutrition
  const dish = await getDish(dish_id);

  // 4. Save meal_dish with nutrition snapshot
  await saveMealDish({
    meal_id: meal.id,
    dish_id,
    servings,
    calories_at_time: dish.calories * servings,
    protein_at_time_g: dish.protein_g * servings,
    // ...
  });

  // 5. Recalculate meal totals
  await recalculateMealTotals(meal.id);

  // 6. Recalculate daily log totals
  await recalculateLogTotals(dailyLog.id);
}
```

### 3. Rating Aggregation
```typescript
async updateDishAverageRating(dishId: string) {
  const result = await ratingRepository
    .createQueryBuilder('rating')
    .select('AVG(rating.rating)', 'avg')
    .addSelect('COUNT(rating.id)', 'count')
    .where('rating.dish_id = :dishId', { dishId })
    .getRawOne();

  await dishRepository.update(dishId, {
    average_rating: result.avg,
    rating_count: result.count
  });
}
```

## Technologies Used

- **NestJS** 10.x - Progressive Node.js framework
- **TypeORM** 0.3.x - ORM for database management
- **PostgreSQL** 14+ - Relational database
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **class-validator** - DTO validation
- **class-transformer** - Object transformation
- **@nestjs/schedule** - Cron jobs
- **@nestjs/swagger** - API documentation

## Security Features

✅ Password hashing with bcrypt
✅ JWT token authentication
✅ OAuth 2.0 integration
✅ Input validation on all endpoints
✅ SQL injection prevention (TypeORM)
✅ CORS configuration
✅ Rate limiting ready
✅ Guest session expiration

## Performance Optimizations

✅ Database indexes on frequently queried columns
✅ Efficient SQL queries with proper joins
✅ Pagination support
✅ Snapshot-based data (immutable records)
✅ Background job processing
✅ Connection pooling

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup database**:
   ```bash
   createdb nutrition_tracker
   ```

3. **Configure environment**:
   ```bash
   cp .env.development .env
   # Edit .env with your settings
   ```

4. **Run migrations**:
   ```bash
   npm run migration:run
   ```

5. **Seed database** (optional):
   ```bash
   npm run seed
   ```

6. **Start development server**:
   ```bash
   npm run start:dev
   ```

7. **Access API**:
   - API: http://localhost:3000/api/v1
   - Swagger: http://localhost:3000/api/v1/docs

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Enable SSL/TLS for database
- [ ] Set `DB_SYNC=false`
- [ ] Configure OAuth production callbacks
- [ ] Set up logging service
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring (APM)
- [ ] Configure backup strategy

## Future Enhancements

Potential features to add:

- Exercise tracking
- Recipe recommendations
- Barcode scanning
- Food photo recognition
- Social features (share meals)
- Meal planning calendar
- Progress charts/analytics
- Nutrition coach AI
- Integration with fitness trackers
- Multi-language support

## Support & Documentation

- **Main README**: Project introduction
- **SETUP.md**: Detailed setup instructions
- **Swagger UI**: Interactive API documentation at `/api/v1/docs`
- **Code Comments**: Inline documentation throughout codebase

## License

MIT License - Feel free to use for personal or commercial projects

---

**Built with NestJS by a Senior NestJS Developer**
**Production-ready, scalable, and following industry best practices**

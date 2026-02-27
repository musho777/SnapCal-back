import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "gender_enum" AS ENUM ('male', 'female', 'other');
      CREATE TYPE "goal_enum" AS ENUM ('lose_weight', 'maintain_weight', 'gain_weight');
      CREATE TYPE "activity_level_enum" AS ENUM ('sedentary', 'light', 'moderate', 'very', 'extra');
      CREATE TYPE "meal_type_enum" AS ENUM ('breakfast', 'lunch', 'dinner');
      CREATE TYPE "auth_provider_enum" AS ENUM ('guest', 'email', 'google', 'apple', 'facebook');
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) UNIQUE,
        "password_hash" varchar(255),
        "auth_provider" auth_provider_enum DEFAULT 'email',
        "is_guest" boolean DEFAULT false,
        "is_active" boolean DEFAULT true,
        "email_verified" boolean DEFAULT false,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "last_login_at" timestamp
      );
      CREATE INDEX "idx_users_email" ON "users"("email");
    `);

    // User profiles table
    await queryRunner.query(`
      CREATE TABLE "user_profiles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "first_name" varchar(255),
        "last_name" varchar(255),
        "date_of_birth" date,
        "gender" gender_enum,
        "height_cm" decimal(5,2),
        "current_weight_kg" decimal(5,2),
        "avatar_url" varchar(500),
        "country_code" varchar(20),
        "timezone" varchar(100),
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // User OAuth accounts table
    await queryRunner.query(`
      CREATE TABLE "user_oauth_accounts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "provider" auth_provider_enum NOT NULL,
        "provider_user_id" varchar(255) NOT NULL,
        "provider_email" varchar(255),
        "access_token" text,
        "refresh_token" text,
        "token_expires_at" timestamp,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        UNIQUE ("provider", "provider_user_id")
      );
    `);

    // Guest sessions table
    await queryRunner.query(`
      CREATE TABLE "guest_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "guest_token" varchar(255) UNIQUE NOT NULL,
        "device_id" varchar(255),
        "device_type" varchar(100),
        "ip_address" varchar(45),
        "user_agent" text,
        "expires_at" timestamp NOT NULL,
        "is_converted" boolean DEFAULT false,
        "converted_user_id" uuid,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "last_activity_at" timestamp
      );
      CREATE INDEX "idx_guest_sessions_token" ON "guest_sessions"("guest_token");
    `);

    // User settings table
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid UNIQUE NOT NULL,
        "goal" goal_enum DEFAULT 'maintain_weight',
        "activity_level" activity_level_enum DEFAULT 'moderate',
        "target_weight_kg" decimal(6,2),
        "notifications_enabled" boolean DEFAULT true,
        "dark_mode" boolean DEFAULT false,
        "measurement_system" varchar(10) DEFAULT 'metric',
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // User calorie targets table
    await queryRunner.query(`
      CREATE TABLE "user_calorie_targets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "target_date" date NOT NULL,
        "target_calories" int NOT NULL,
        "target_protein_g" decimal(5,2),
        "target_carbs_g" decimal(5,2),
        "target_fats_g" decimal(5,2),
        "notes" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        UNIQUE ("user_id", "target_date")
      );
      CREATE INDEX "idx_calorie_targets_user_date" ON "user_calorie_targets"("user_id", "target_date");
    `);

    // Body measurements table
    await queryRunner.query(`
      CREATE TABLE "body_measurements" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "weight_kg" decimal(5,2),
        "height_cm" decimal(5,2),
        "measured_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        UNIQUE ("user_id", "measured_at")
      );
    `);

    // User daily logs table
    await queryRunner.query(`
      CREATE TABLE "user_daily_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "log_date" date NOT NULL,
        "calories_consumed" int DEFAULT 0,
        "protein_consumed_g" decimal(6,2) DEFAULT 0,
        "carbs_consumed_g" decimal(6,2) DEFAULT 0,
        "fats_consumed_g" decimal(6,2) DEFAULT 0,
        "calories_burned" int DEFAULT 0,
        "target_calories" int,
        "water_intake_liters" decimal(5,2),
        "notes" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        UNIQUE ("user_id", "log_date")
      );
      CREATE INDEX "idx_daily_logs_user_date" ON "user_daily_logs"("user_id", "log_date");
    `);

    // Dish categories table
    await queryRunner.query(`
      CREATE TABLE "dish_categories" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) UNIQUE NOT NULL,
        "slug" varchar(100) UNIQUE NOT NULL,
        "description" text,
        "icon_url" varchar(255),
        "sort_order" int DEFAULT 0,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Dishes table
    await queryRunner.query(`
      CREATE TABLE "dishes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "image_url" varchar(500),
        "prep_time_minutes" int,
        "cook_time_minutes" int,
        "servings" int DEFAULT 1,
        "calories" int NOT NULL,
        "protein_g" decimal(6,2) NOT NULL,
        "carbs_g" decimal(6,2) NOT NULL,
        "fats_g" decimal(6,2) NOT NULL,
        "fiber_g" decimal(6,2),
        "sugar_g" decimal(6,2),
        "sodium_mg" decimal(6,2),
        "is_public" boolean DEFAULT true,
        "is_active" boolean DEFAULT true,
        "created_by" uuid,
        "average_rating" decimal(3,2) DEFAULT 0,
        "rating_count" int DEFAULT 0,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Dish category mapping table
    await queryRunner.query(`
      CREATE TABLE "dish_category_mapping" (
        "dish_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        PRIMARY KEY ("dish_id", "category_id"),
        FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE,
        FOREIGN KEY ("category_id") REFERENCES "dish_categories"("id") ON DELETE CASCADE
      );
    `);

    // Dish ingredients table
    await queryRunner.query(`
      CREATE TABLE "dish_ingredients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "dish_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "quantity" varchar(100),
        "unit" varchar(50),
        "sort_order" int DEFAULT 0,
        "is_optional" boolean DEFAULT false,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE
      );
    `);

    // Dish cooking steps table
    await queryRunner.query(`
      CREATE TABLE "dish_cooking_steps" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "dish_id" uuid NOT NULL,
        "step_number" int NOT NULL,
        "instruction" text NOT NULL,
        "duration_minutes" int,
        "image_url" varchar(500),
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE
      );
    `);

    // Meals table
    await queryRunner.query(`
      CREATE TABLE "meals" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "daily_log_id" uuid NOT NULL,
        "meal_type" meal_type_enum NOT NULL,
        "total_calories" int DEFAULT 0,
        "total_protein_g" decimal(6,2) DEFAULT 0,
        "total_carbs_g" decimal(6,2) DEFAULT 0,
        "total_fats_g" decimal(6,2) DEFAULT 0,
        "consumed_at" timestamp,
        "notes" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("daily_log_id") REFERENCES "user_daily_logs"("id") ON DELETE CASCADE,
        UNIQUE ("daily_log_id", "meal_type")
      );
    `);

    // Meal dishes table
    await queryRunner.query(`
      CREATE TABLE "meal_dishes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "meal_id" uuid NOT NULL,
        "dish_id" uuid NOT NULL,
        "servings" decimal(5,2) DEFAULT 1,
        "calories_at_time" int NOT NULL,
        "protein_at_time_g" decimal(6,2) NOT NULL,
        "carbs_at_time_g" decimal(6,2) NOT NULL,
        "fats_at_time_g" decimal(6,2) NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE,
        FOREIGN KEY ("dish_id") REFERENCES "dishes"("id")
      );
      CREATE INDEX "idx_meal_dishes_meal" ON "meal_dishes"("meal_id");
    `);

    // Dish ratings table
    await queryRunner.query(`
      CREATE TABLE "dish_ratings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "dish_id" uuid NOT NULL,
        "rating" int NOT NULL,
        "review" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("dish_id") REFERENCES "dishes"("id") ON DELETE CASCADE,
        UNIQUE ("user_id", "dish_id")
      );
      CREATE INDEX "idx_dish_ratings_dish" ON "dish_ratings"("dish_id");
    `);

    // Diet preferences table
    await queryRunner.query(`
      CREATE TABLE "diet_preferences" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "preference_type" varchar(100) NOT NULL,
        "preference_value" varchar(255) NOT NULL,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "diet_preferences";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dish_ratings";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meal_dishes";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meals";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dish_cooking_steps";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dish_ingredients";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dish_category_mapping";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dishes";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dish_categories";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_daily_logs";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "body_measurements";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_calorie_targets";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_settings";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "guest_sessions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_oauth_accounts";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_provider_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "meal_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "activity_level_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "goal_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "gender_enum";`);
  }
}

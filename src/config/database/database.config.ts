import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { User } from "@modules/users/entities/user.entity";
import { UserProfile } from "@modules/users/entities/user-profile.entity";
import { UserOAuthAccount } from "@modules/users/entities/user-oauth-account.entity";
import { BodyMeasurement } from "@modules/users/entities/body-measurement.entity";
import { UserSettings } from "@modules/settings/entities/user-settings.entity";
import { UserCalorieTarget } from "@modules/settings/entities/user-calorie-target.entity";
import { UserDailyLog } from "@modules/logs/entities/user-daily-log.entity";
import { Meal } from "@modules/meals/entities/meal.entity";
import { MealDish } from "@modules/meals/entities/meal-dish.entity";
import { Dish } from "@modules/dishes/entities/dish.entity";
import { DishCategory } from "@modules/dishes/entities/dish-category.entity";
import { DishIngredient } from "@modules/dishes/entities/dish-ingredient.entity";
import { DishCookingStep } from "@modules/dishes/entities/dish-cooking-step.entity";
import { DishRating } from "@modules/ratings/entities/dish-rating.entity";
import { DietPreference } from "@modules/diet-preferences/entities/diet-preference.entity";

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // Check if DATABASE_URL exists (Railway, Heroku, etc.)
    const databaseUrl = this.configService.get<string>("DATABASE_URL");

    if (databaseUrl) {
      // Parse DATABASE_URL for cloud deployments
      return {
        type: "postgres",
        url: databaseUrl,
        entities: [
          User,
          UserProfile,
          UserOAuthAccount,
          BodyMeasurement,
          UserSettings,
          UserCalorieTarget,
          UserDailyLog,
          Meal,
          MealDish,
          Dish,
          DishCategory,
          DishIngredient,
          DishCookingStep,
          DishRating,
          DietPreference,
        ],
        synchronize: this.configService.get<boolean>("DB_SYNC") || false,
        logging: this.configService.get<boolean>("DB_LOGGING") || false,
        ssl: { rejectUnauthorized: false },
      };
    }

    // Fall back to individual environment variables for local development
    return {
      type: "postgres",
      host: this.configService.get<string>("DB_HOST"),
      port: parseInt(this.configService.get<string>("DB_PORT") || "5432", 10),
      username: this.configService.get<string>("DB_USERNAME"),
      password: this.configService.get<string>("DB_PASSWORD"),
      database: this.configService.get<string>("DB_DATABASE"),
      entities: [
        User,
        UserProfile,
        UserOAuthAccount,
        BodyMeasurement,
        UserSettings,
        UserCalorieTarget,
        UserDailyLog,
        Meal,
        MealDish,
        Dish,
        DishCategory,
        DishIngredient,
        DishCookingStep,
        DishRating,
        DietPreference,
      ],
      synchronize: this.configService.get<boolean>("DB_SYNC") || false,
      logging: this.configService.get<boolean>("DB_LOGGING") || false,
      ssl:
        this.configService.get<string>("NODE_ENV") === "production"
          ? { rejectUnauthorized: false }
          : false,
    };
  }
}

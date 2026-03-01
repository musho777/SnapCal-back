import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DishesModule } from "./modules/dishes/dishes.module";
import { MealsModule } from "./modules/meals/meals.module";
import { LogsModule } from "./modules/logs/logs.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { RatingsModule } from "./modules/ratings/ratings.module";
import { DietPreferencesModule } from "./modules/diet-preferences/diet-preferences.module";
import { DietTagsModule } from "./modules/diet-tags/diet-tags.module";
import { DatabaseConfig } from "./config/database/database.config";
import { TasksModule } from "./common/tasks/tasks.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
      inject: [ConfigService],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule.forRoot(),
    UsersModule,
    DishesModule,
    MealsModule,
    LogsModule,
    SettingsModule,
    RatingsModule,
    DietPreferencesModule,
    DietTagsModule,

    // Background tasks
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

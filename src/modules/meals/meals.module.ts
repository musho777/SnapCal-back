import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { Meal } from './entities/meal.entity';
import { MealDish } from './entities/meal-dish.entity';
import { Dish } from '../dishes/entities/dish.entity';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meal, MealDish, Dish]),
    LogsModule, // Import to use LogsService
  ],
  controllers: [MealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}

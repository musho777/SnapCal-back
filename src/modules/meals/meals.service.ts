import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { MealDish } from './entities/meal-dish.entity';
import { Dish } from '../dishes/entities/dish.entity';
import { LogsService } from '../logs/logs.service';
import { AddDishToMealDto } from './dto/add-dish-to-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal)
    private mealRepository: Repository<Meal>,
    @InjectRepository(MealDish)
    private mealDishRepository: Repository<MealDish>,
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    private logsService: LogsService,
  ) {}

  /**
   * Meal Processing Algorithm
   * 1. Find daily log by user_id + date (create if not exists)
   * 2. Find or create meal by daily_log_id + meal_type
   * 3. Insert dish into meal_dishes
   * 4. Recalculate meal total calories
   * 5. Update daily log calories_consumed
   */
  async addDishToMeal(userId: string, addDto: AddDishToMealDto) {
    const { dish_id, meal_type, date, servings, notes } = addDto;

    // 1. Find or create daily log
    const logDate = new Date(date);
    const dailyLog = await this.logsService.findOrCreateDailyLog(
      userId,
      logDate,
    );

    // 2. Find or create meal
    let meal = await this.mealRepository.findOne({
      where: {
        daily_log_id: dailyLog.id,
        meal_type,
      },
    });

    if (!meal) {
      meal = this.mealRepository.create({
        daily_log_id: dailyLog.id,
        meal_type,
        consumed_at: new Date(),
        notes: notes || null,
      });
      await this.mealRepository.save(meal);
    }

    // Get dish nutrition info
    const dish = await this.dishRepository.findOne({
      where: { id: dish_id },
    });

    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    // 3. Insert dish into meal_dishes with snapshot of nutrition
    const mealDish = this.mealDishRepository.create({
      meal_id: meal.id,
      dish_id: dish.id,
      servings,
      calories_at_time: Math.round(dish.calories * servings),
      protein_at_time_g: Number((dish.protein_g * servings).toFixed(2)),
      carbs_at_time_g: Number((dish.carbs_g * servings).toFixed(2)),
      fats_at_time_g: Number((dish.fats_g * servings).toFixed(2)),
    });

    await this.mealDishRepository.save(mealDish);

    // 4. Recalculate meal totals
    await this.recalculateMealTotals(meal.id);

    // 5. Update daily log totals
    await this.logsService.recalculateLogTotals(dailyLog.id);

    return {
      meal_dish: mealDish,
      meal,
    };
  }

  async removeDishFromMeal(userId: string, mealDishId: string) {
    const mealDish = await this.mealDishRepository.findOne({
      where: { id: mealDishId },
      relations: ['meal', 'meal.daily_log'],
    });

    if (!mealDish) {
      throw new NotFoundException('Meal dish not found');
    }

    // Verify ownership
    if (mealDish.meal.daily_log.user_id !== userId) {
      throw new NotFoundException('Meal dish not found');
    }

    const mealId = mealDish.meal.id;
    const dailyLogId = mealDish.meal.daily_log.id;

    // Delete meal dish
    await this.mealDishRepository.delete(mealDishId);

    // Recalculate meal totals
    await this.recalculateMealTotals(mealId);

    // Update daily log totals
    await this.logsService.recalculateLogTotals(dailyLogId);

    return { message: 'Dish removed from meal successfully' };
  }

  async getMeal(mealId: string) {
    const meal = await this.mealRepository.findOne({
      where: { id: mealId },
      relations: ['meal_dishes', 'meal_dishes.dish'],
    });

    if (!meal) {
      throw new NotFoundException('Meal not found');
    }

    return meal;
  }

  private async recalculateMealTotals(mealId: string) {
    const meal = await this.mealRepository.findOne({
      where: { id: mealId },
      relations: ['meal_dishes'],
    });

    if (!meal) {
      return;
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    for (const mealDish of meal.meal_dishes) {
      totalCalories += mealDish.calories_at_time;
      totalProtein += Number(mealDish.protein_at_time_g);
      totalCarbs += Number(mealDish.carbs_at_time_g);
      totalFats += Number(mealDish.fats_at_time_g);
    }

    meal.total_calories = totalCalories;
    meal.total_protein_g = totalProtein;
    meal.total_carbs_g = totalCarbs;
    meal.total_fats_g = totalFats;

    await this.mealRepository.save(meal);
  }
}

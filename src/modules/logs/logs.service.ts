import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserDailyLog } from "./entities/user-daily-log.entity";
import { BurnedDish } from "./entities/burned-dish.entity";
import { Dish } from "../dishes/entities/dish.entity";
import { Meal } from "../meals/entities/meal.entity";
import { UserSettings } from "../settings/entities/user-settings.entity";
import { CreateDailyLogDto } from "./dto/create-daily-log.dto";
import { UpdateDailyLogDto } from "./dto/update-daily-log.dto";

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(UserDailyLog)
    private logRepository: Repository<UserDailyLog>,
    @InjectRepository(BurnedDish)
    private burnedDishRepository: Repository<BurnedDish>,
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    @InjectRepository(UserSettings)
    private settingsRepository: Repository<UserSettings>,
  ) {}

  async findOrCreateDailyLog(
    userId: string,
    logDate: Date,
  ): Promise<UserDailyLog> {
    let log = await this.logRepository.findOne({
      where: {
        user_id: userId,
        log_date: logDate,
      },
    });

    if (!log) {
      log = this.logRepository.create({
        user_id: userId,
        log_date: logDate,
      });
      await this.logRepository.save(log);
    }

    return log;
  }

  async getDailyLog(userId: string, date: string) {
    const logDate = new Date(date);

    const log = await this.logRepository
      .createQueryBuilder("log")
      .leftJoinAndSelect("log.meals", "meals")
      .leftJoinAndSelect("meals.meal_dishes", "meal_dishes")
      .leftJoinAndSelect("meal_dishes.dish", "dish")
      .leftJoinAndSelect("log.burned_dishes", "burned_dishes")
      .leftJoinAndSelect("burned_dishes.dish", "burned_dish_info")
      .where("log.user_id = :userId", { userId })
      .andWhere("log.log_date = :logDate", { logDate })
      .getOne();

    if (!log) {
      return null;
    }

    // Calculate calories consumed from all meals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    if (log.meals && log.meals.length > 0) {
      for (const meal of log.meals) {
        totalCalories += meal.total_calories || 0;
        totalProtein += Number(meal.total_protein_g || 0);
        totalCarbs += Number(meal.total_carbs_g || 0);
        totalFats += Number(meal.total_fats_g || 0);
      }
    }

    // Update the log if values have changed
    if (
      log.calories_consumed !== totalCalories ||
      log.protein_consumed_g !== totalProtein ||
      log.carbs_consumed_g !== totalCarbs ||
      log.fats_consumed_g !== totalFats
    ) {
      log.calories_consumed = totalCalories;
      log.protein_consumed_g = totalProtein;
      log.carbs_consumed_g = totalCarbs;
      log.fats_consumed_g = totalFats;

      await this.logRepository.save(log);
    }

    const settings = await this.settingsRepository.findOne({
      where: { user_id: userId },
    });

    log.target_calories = settings?.target_calories || null;

    return log;
  }

  async getLogsByDateRange(userId: string, startDate: string, endDate: string) {
    const logs = await this.logRepository
      .createQueryBuilder("log")
      .leftJoinAndSelect("log.meals", "meals")
      .leftJoinAndSelect("meals.meal_dishes", "meal_dishes")
      .leftJoinAndSelect("meal_dishes.dish", "dish")
      .leftJoinAndSelect("log.burned_dishes", "burned_dishes")
      .leftJoinAndSelect("burned_dishes.dish", "burned_dish_info")
      .where("log.user_id = :userId", { userId })
      .andWhere("log.log_date BETWEEN :startDate AND :endDate", {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
      .orderBy("log.log_date", "DESC")
      .getMany();

    // Calculate calories consumed for each log
    for (const log of logs) {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      if (log.meals && log.meals.length > 0) {
        for (const meal of log.meals) {
          totalCalories += meal.total_calories || 0;
          totalProtein += Number(meal.total_protein_g || 0);
          totalCarbs += Number(meal.total_carbs_g || 0);
          totalFats += Number(meal.total_fats_g || 0);
        }
      }

      // Update if values changed
      if (
        log.calories_consumed !== totalCalories ||
        log.protein_consumed_g !== totalProtein ||
        log.carbs_consumed_g !== totalCarbs ||
        log.fats_consumed_g !== totalFats
      ) {
        log.calories_consumed = totalCalories;
        log.protein_consumed_g = totalProtein;
        log.carbs_consumed_g = totalCarbs;
        log.fats_consumed_g = totalFats;
      }
    }

    // Save all updated logs in batch
    await this.logRepository.save(logs);

    // Fetch user settings to get target_calories
    const settings = await this.settingsRepository.findOne({
      where: { user_id: userId },
    });

    // Add target_calories from settings to each log response
    for (const log of logs) {
      log.target_calories = settings?.target_calories || null;
    }

    return logs;
  }

  async updateDailyLog(
    userId: string,
    date: string,
    updateDto: UpdateDailyLogDto,
  ) {
    const logDate = new Date(date);
    let log = await this.findOrCreateDailyLog(userId, logDate);

    if (updateDto.calories_burned !== undefined) {
      log.calories_burned = updateDto.calories_burned;
    }

    if (updateDto.water_intake_liters !== undefined) {
      log.water_intake_liters = updateDto.water_intake_liters;
    }

    if (updateDto.notes !== undefined) {
      log.notes = updateDto.notes;
    }

    await this.logRepository.save(log);

    return log;
  }

  async recalculateLogTotals(logId: string) {
    const log = await this.logRepository.findOne({
      where: { id: logId },
      relations: ["meals"],
    });

    if (!log) {
      return;
    }

    // Sum up all meals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    for (const meal of log.meals) {
      totalCalories += meal.total_calories;
      totalProtein += Number(meal.total_protein_g);
      totalCarbs += Number(meal.total_carbs_g);
      totalFats += Number(meal.total_fats_g);
    }

    log.calories_consumed = totalCalories;
    log.protein_consumed_g = totalProtein;
    log.carbs_consumed_g = totalCarbs;
    log.fats_consumed_g = totalFats;

    await this.logRepository.save(log);

    return log;
  }

  async toggleDishInCaloriesBurned(
    userId: string,
    date: string,
    dishId: string,
    mealId: string,
  ) {
    const logDate = new Date(date);
    const dailyLog = await this.findOrCreateDailyLog(userId, logDate);

    // Check if this dish from this specific meal is already added
    const existingBurnedDish = await this.burnedDishRepository.findOne({
      where: {
        daily_log_id: dailyLog.id,
        dish_id: dishId,
        meal_id: mealId,
      },
    });

    // If already exists, REMOVE it
    if (existingBurnedDish) {
      // Update daily log calories_burned
      dailyLog.calories_burned = Math.max(
        0,
        (dailyLog.calories_burned || 0) - existingBurnedDish.calories_burned,
      );
      await this.logRepository.save(dailyLog);

      // Remove the burned dish record
      await this.burnedDishRepository.delete(existingBurnedDish.id);

      return {
        message: "Dish calories removed from calories burned",
        action: "removed",
        isAdded: false,
      };
    }

    // If not exists, ADD it
    const dish = await this.dishRepository.findOne({
      where: { id: dishId },
    });

    if (!dish) {
      throw new NotFoundException("Dish not found");
    }

    // Create burned dish record
    const burnedDish = this.burnedDishRepository.create({
      daily_log_id: dailyLog.id,
      dish_id: dishId,
      meal_id: mealId,
      calories_burned: dish.calories,
    });

    await this.burnedDishRepository.save(burnedDish);

    // Update daily log calories_burned
    dailyLog.calories_burned = (dailyLog.calories_burned || 0) + dish.calories;
    await this.logRepository.save(dailyLog);

    return {
      message: "Dish calories added to calories burned",
      action: "added",
      isAdded: true,
      burnedDish,
    };
  }

  async removeDishFromCaloriesBurned(userId: string, burnedDishId: string) {
    // Find the burned dish record with its daily log
    const burnedDish = await this.burnedDishRepository.findOne({
      where: { id: burnedDishId },
      relations: ["daily_log"],
    });

    if (!burnedDish) {
      throw new NotFoundException("Burned dish record not found");
    }

    // Verify ownership
    if (burnedDish.daily_log.user_id !== userId) {
      throw new NotFoundException("Burned dish record not found");
    }

    const dailyLog = burnedDish.daily_log;

    // Update daily log calories_burned
    dailyLog.calories_burned = Math.max(
      0,
      (dailyLog.calories_burned || 0) - burnedDish.calories_burned,
    );
    await this.logRepository.save(dailyLog);

    // Remove the burned dish record
    await this.burnedDishRepository.delete(burnedDish.id);

    return { message: "Dish calories removed from calories burned" };
  }
}

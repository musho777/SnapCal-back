import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserDailyLog } from './entities/user-daily-log.entity';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(UserDailyLog)
    private logRepository: Repository<UserDailyLog>,
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

    const log = await this.logRepository.findOne({
      where: {
        user_id: userId,
        log_date: logDate,
      },
      relations: ['meals', 'meals.meal_dishes', 'meals.meal_dishes.dish'],
    });

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

    return log;
  }

  async getLogsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    const logs = await this.logRepository.find({
      where: {
        user_id: userId,
        log_date: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['meals'],
      order: { log_date: 'DESC' },
    });

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
      relations: ['meals'],
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
}

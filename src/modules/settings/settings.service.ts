import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { UserSettings } from './entities/user-settings.entity';
import { UserCalorieTarget } from './entities/user-calorie-target.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateCalorieTargetDto } from './dto/create-calorie-target.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private settingsRepository: Repository<UserSettings>,
    @InjectRepository(UserCalorieTarget)
    private calorieTargetRepository: Repository<UserCalorieTarget>,
  ) {}

  async getSettings(userId: string) {
    let settings = await this.settingsRepository.findOne({
      where: { user_id: userId },
    });

    if (!settings) {
      // Create default settings
      settings = this.settingsRepository.create({
        user_id: userId,
      });
      await this.settingsRepository.save(settings);
    }

    return settings;
  }

  async updateSettings(userId: string, updateDto: UpdateSettingsDto) {
    let settings = await this.settingsRepository.findOne({
      where: { user_id: userId },
    });

    if (!settings) {
      settings = this.settingsRepository.create({
        user_id: userId,
        ...updateDto,
      });
    } else {
      Object.assign(settings, updateDto);
    }

    await this.settingsRepository.save(settings);

    return settings;
  }

  async getCurrentCalorieTarget(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();

    // Snapshot-based fallback logic
    const target = await this.calorieTargetRepository.findOne({
      where: {
        user_id: userId,
        target_date: LessThanOrEqual(targetDate),
      },
      order: { target_date: 'DESC' },
    });

    if (!target) {
      // Return default target if no snapshot exists
      return {
        target_calories: 2000,
        target_protein_g: null,
        target_carbs_g: null,
        target_fats_g: null,
        is_default: true,
      };
    }

    return {
      ...target,
      is_default: false,
    };
  }

  async getCalorieTargets(userId: string, limit: number = 30) {
    const targets = await this.calorieTargetRepository.find({
      where: { user_id: userId },
      order: { target_date: 'DESC' },
      take: limit,
    });

    return targets;
  }

  async createCalorieTarget(
    userId: string,
    createDto: CreateCalorieTargetDto,
  ) {
    const target = this.calorieTargetRepository.create({
      user_id: userId,
      target_date: new Date(createDto.target_date),
      target_calories: createDto.target_calories,
      target_protein_g: createDto.target_protein_g || null,
      target_carbs_g: createDto.target_carbs_g || null,
      target_fats_g: createDto.target_fats_g || null,
      notes: createDto.notes || null,
    });

    await this.calorieTargetRepository.save(target);

    return target;
  }

  async deleteCalorieTarget(userId: string, targetId: string) {
    const result = await this.calorieTargetRepository.delete({
      id: targetId,
      user_id: userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Calorie target not found');
    }

    return { message: 'Calorie target deleted successfully' };
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DietPreference } from "./entities/diet-preference.entity";
import { CreateDietPreferenceDto } from "./dto/create-diet-preference.dto";

@Injectable()
export class DietPreferencesService {
  constructor(
    @InjectRepository(DietPreference)
    private preferenceRepository: Repository<DietPreference>,
  ) {}

  async getUserPreferences(userId: string) {
    const preferences = await this.preferenceRepository.find({
      where: { user_id: userId, is_active: true },
      order: { created_at: "DESC" },
    });

    return preferences;
  }

  async createPreference(userId: string, createDto: CreateDietPreferenceDto) {
    const preference = this.preferenceRepository.create({
      user_id: userId,
      preference_type: createDto.preference_type,
      preference_value: createDto.preference_value,
    });

    await this.preferenceRepository.save(preference);

    return preference;
  }

  async deletePreference(userId: string, preferenceId: string) {
    const result = await this.preferenceRepository.delete({
      id: preferenceId,
      user_id: userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException("Preference not found");
    }

    return { message: "Preference deleted successfully" };
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { User } from "../users/entities/user.entity";
import { DietTag } from "../diet-tags/entities/diet-tag.entity";
import { CreateDietPreferenceDto } from "./dto/create-diet-preference.dto";

@Injectable()
export class DietPreferencesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DietTag)
    private dietTagRepository: Repository<DietTag>,
  ) {}

  async getUserPreferences(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['diet_preferences'],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user.diet_preferences;
  }

  async createPreference(userId: string, createDto: CreateDietPreferenceDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['diet_preferences'],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const dietTags = await this.dietTagRepository.find({
      where: { id: In(createDto.diet_tag_ids) },
    });

    if (dietTags.length !== createDto.diet_tag_ids.length) {
      throw new NotFoundException("One or more diet tags not found");
    }

    user.diet_preferences = dietTags;
    await this.userRepository.save(user);

    return dietTags;
  }

  async deletePreference(userId: string, dietTagId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['diet_preferences'],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.diet_preferences = user.diet_preferences.filter(
      (tag) => tag.id !== dietTagId,
    );

    await this.userRepository.save(user);

    return { message: "Preference deleted successfully" };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { BodyMeasurement } from './entities/body-measurement.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateBodyMeasurementDto } from './dto/create-body-measurement.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(BodyMeasurement)
    private measurementRepository: Repository<BodyMeasurement>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'settings'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      is_guest: user.is_guest,
      auth_provider: user.auth_provider,
      profile: user.profile,
      settings: user.settings,
    };
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    let profile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = this.profileRepository.create({
        user_id: userId,
        ...updateDto,
      });
    } else {
      // Update existing profile
      Object.assign(profile, updateDto);
    }

    await this.profileRepository.save(profile);

    return profile;
  }

  async getBodyMeasurements(userId: string, limit: number = 30) {
    const measurements = await this.measurementRepository.find({
      where: { user_id: userId },
      order: { measured_at: 'DESC' },
      take: limit,
    });

    return measurements;
  }

  async createBodyMeasurement(
    userId: string,
    createDto: CreateBodyMeasurementDto,
  ) {
    const measurement = this.measurementRepository.create({
      user_id: userId,
      weight_kg: createDto.weight_kg || null,
      height_cm: createDto.height_cm || null,
      measured_at: createDto.measured_at
        ? new Date(createDto.measured_at)
        : new Date(),
    });

    await this.measurementRepository.save(measurement);

    return measurement;
  }

  async deleteBodyMeasurement(userId: string, measurementId: string) {
    const result = await this.measurementRepository.delete({
      id: measurementId,
      user_id: userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Measurement not found');
    }

    return { message: 'Measurement deleted successfully' };
  }
}

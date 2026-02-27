import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, LessThan, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { GuestSession } from './entities/guest-session.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';
import { UserCalorieTarget } from '../settings/entities/user-calorie-target.entity';
import { DietPreference } from '../diet-preferences/entities/diet-preference.entity';
import { CreateGuestSessionDto } from './dto/create-guest-session.dto';
import { ConvertGuestDto } from './dto/convert-guest.dto';
import { AuthProvider } from '@/common/enums';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(GuestSession)
    private guestSessionRepository: Repository<GuestSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserSettings)
    private settingsRepository: Repository<UserSettings>,
    @InjectRepository(UserCalorieTarget)
    private calorieTargetRepository: Repository<UserCalorieTarget>,
    @InjectRepository(DietPreference)
    private dietPreferenceRepository: Repository<DietPreference>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createGuestSession(
    createGuestDto: CreateGuestSessionDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const guest_token = uuidv4();
    const expirationDays =
      this.configService.get<number>('GUEST_SESSION_EXPIRATION_DAYS') || 30;

    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + expirationDays);

    // Create guest user
    const user = this.userRepository.create({
      auth_provider: AuthProvider.GUEST,
      is_guest: true,
      is_active: true,
    });

    await this.userRepository.save(user);

    // Create guest session
    const session = this.guestSessionRepository.create({
      guest_token,
      device_id: createGuestDto.device_id || null,
      device_type: createGuestDto.device_type || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      expires_at,
      last_activity_at: new Date(),
    });

    await this.guestSessionRepository.save(session);

    // Create user profile with onboarding data
    const profile = this.userProfileRepository.create({
      user_id: user.id,
      date_of_birth: createGuestDto.date_of_birth
        ? new Date(createGuestDto.date_of_birth)
        : null,
      height_cm: createGuestDto.height_cm || null,
      current_weight_kg: createGuestDto.current_weight_kg || null,
      gender: createGuestDto.gender || null,
    });

    await this.userProfileRepository.save(profile);

    // Create settings with onboarding data
    const settings = this.settingsRepository.create({
      user_id: user.id,
      goal: createGuestDto.goal,
      activity_level: createGuestDto.activity_level,
      target_weight_kg: createGuestDto.target_weight_kg || null,
      target_calories: createGuestDto.target_calories || null,
      target_protein_g: createGuestDto.target_protein_g || null,
      target_carbs_g: createGuestDto.target_carbs_g || null,
      target_fats_g: createGuestDto.target_fats_g || null,
      measurement_system: createGuestDto.measurement_system || 'metric',
    });

    await this.settingsRepository.save(settings);

    // Create initial calorie target snapshot if provided
    if (createGuestDto.target_calories) {
      const calorieTarget = this.calorieTargetRepository.create({
        user_id: user.id,
        target_date: new Date(),
        target_calories: createGuestDto.target_calories,
        target_protein_g: createGuestDto.target_protein_g || null,
        target_carbs_g: createGuestDto.target_carbs_g || null,
        target_fats_g: createGuestDto.target_fats_g || null,
        notes: 'Initial onboarding targets',
      });

      await this.calorieTargetRepository.save(calorieTarget);
    }

    // Create diet preferences if provided
    if (createGuestDto.preferences && createGuestDto.preferences.length > 0) {
      const dietPreferences = createGuestDto.preferences.map((pref) =>
        this.dietPreferenceRepository.create({
          user_id: user.id,
          preference_type: pref.preference_type,
          preference_value: pref.preference_value,
          is_active: true,
        }),
      );

      await this.dietPreferenceRepository.save(dietPreferences);
    }

    // Generate JWT for guest
    const payload: JwtPayload = {
      sub: user.id,
      email: null,
      is_guest: true,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
    });

    return {
      access_token,
      guest_token,
      token_type: 'Bearer',
      user_id: user.id,
      expires_at,
    };
  }

  async validateGuestSession(guest_token: string): Promise<GuestSession> {
    const session = await this.guestSessionRepository.findOne({
      where: { guest_token },
    });

    if (!session) {
      throw new NotFoundException('Guest session not found');
    }

    if (session.expires_at < new Date()) {
      throw new UnauthorizedException('Guest session expired');
    }

    if (session.is_converted) {
      throw new UnauthorizedException('Guest session already converted');
    }

    // Update last activity
    session.last_activity_at = new Date();
    await this.guestSessionRepository.save(session);

    return session;
  }

  async convertGuestToUser(
    userId: string,
    convertDto: ConvertGuestDto,
  ): Promise<any> {
    const { email, password } = convertDto;

    // Find guest user
    const user = await this.userRepository.findOne({
      where: { id: userId, is_guest: true },
    });

    if (!user) {
      throw new NotFoundException('Guest user not found');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Update user
    user.email = email;
    user.password_hash = password_hash;
    user.auth_provider = AuthProvider.EMAIL;
    user.is_guest = false;
    user.email_verified = false;

    await this.userRepository.save(user);

    // Mark all guest sessions as converted
    await this.guestSessionRepository.update(
      { converted_user_id: IsNull() },
      { is_converted: true, converted_user_id: userId },
    );

    // Generate new tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      is_guest: false,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    });

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        is_guest: false,
      },
    };
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.guestSessionRepository.delete({
      expires_at: LessThan(new Date()),
      is_converted: false,
    });

    return result.affected || 0;
  }
}

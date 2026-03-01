import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { UserOAuthAccount } from '../users/entities/user-oauth-account.entity';
import { BodyMeasurement } from '../users/entities/body-measurement.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';
import { UserCalorieTarget } from '../settings/entities/user-calorie-target.entity';
import { DietTag } from '../diet-tags/entities/diet-tag.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateGuestSessionDto } from '../guest/dto/create-guest-session.dto';
import { ConvertGuestDto } from '../guest/dto/convert-guest.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthProvider } from '@/common/enums';
import { EmailVerification } from './entities/email-verification.entity';
import { EmailService } from './services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserOAuthAccount)
    private oauthRepository: Repository<UserOAuthAccount>,
    @InjectRepository(BodyMeasurement)
    private bodyMeasurementRepository: Repository<BodyMeasurement>,
    @InjectRepository(UserSettings)
    private settingsRepository: Repository<UserSettings>,
    @InjectRepository(UserCalorieTarget)
    private calorieTargetRepository: Repository<UserCalorieTarget>,
    @InjectRepository(DietTag)
    private dietTagRepository: Repository<DietTag>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, first_name, last_name } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password_hash,
      auth_provider: AuthProvider.EMAIL,
      is_guest: false,
      email_verified: false,
    });

    await this.userRepository.save(user);

    // Create profile
    const profile = this.userProfileRepository.create({
      user_id: user.id,
      first_name: first_name || null,
      last_name: last_name || null,
    });

    await this.userProfileRepository.save(profile);

    // Create default settings
    const settings = this.settingsRepository.create({
      user_id: user.id,
    });

    await this.settingsRepository.save(settings);

    // Generate tokens
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.last_login_at = new Date();
    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async handleOAuthLogin(
    provider: AuthProvider,
    oauthData: any,
  ): Promise<AuthResponse> {
    const { provider_user_id, email, access_token, refresh_token } = oauthData;

    // Check if OAuth account exists
    let oauthAccount = await this.oauthRepository.findOne({
      where: { provider, provider_user_id },
      relations: ['user'],
    });

    let user: User | null = null;

    if (oauthAccount) {
      // Existing OAuth account
      user = oauthAccount.user;

      // Update tokens
      oauthAccount.access_token = access_token;
      oauthAccount.refresh_token = refresh_token;
      await this.oauthRepository.save(oauthAccount);
    } else {
      // New OAuth account - check if email exists
      if (email) {
        user = await this.userRepository.findOne({ where: { email } });
      }

      if (!user) {
        // Create new user
        user = this.userRepository.create({
          email: email || null,
          auth_provider: provider,
          is_guest: false,
          email_verified: !!email,
        });

        await this.userRepository.save(user);

        // Create profile
        const profile = this.userProfileRepository.create({
          user_id: user.id,
          first_name: oauthData.first_name || null,
          last_name: oauthData.last_name || null,
          avatar_url: oauthData.avatar_url || null,
        });

        await this.userProfileRepository.save(profile);

        // Create default settings
        const settings = this.settingsRepository.create({
          user_id: user.id,
        });

        await this.settingsRepository.save(settings);
      }

      // Create OAuth account
      oauthAccount = this.oauthRepository.create({
        user_id: user.id,
        provider,
        provider_user_id,
        provider_email: email || null,
        access_token,
        refresh_token,
      });

      await this.oauthRepository.save(oauthAccount);
    }

    // Update last login
    user.last_login_at = new Date();
    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async refreshToken(refresh_token: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, is_active: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      is_guest: user.is_guest,
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
      expires_in: 604800, // 7 days in seconds
      user: {
        id: user.id,
        email: user.email,
        is_guest: user.is_guest,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // ==================== Guest User Methods ====================

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

    // Create guest user with session data
    const user = this.userRepository.create({
      auth_provider: AuthProvider.GUEST,
      is_guest: true,
      is_active: true,
      guest_token,
      device_id: createGuestDto.device_id || null,
      device_type: createGuestDto.device_type || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      expires_at,
      last_activity_at: new Date(),
    });

    await this.userRepository.save(user);

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

    // Create initial body measurement if provided
    if (createGuestDto.height_cm || createGuestDto.current_weight_kg) {
      const measurement = this.bodyMeasurementRepository.create({
        user_id: user.id,
        height_cm: createGuestDto.height_cm || null,
        weight_kg: createGuestDto.current_weight_kg || null,
        measured_at: new Date(),
      });

      await this.bodyMeasurementRepository.save(measurement);
    }

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

    // Link diet tags if provided
    if (createGuestDto.diet_tag_ids && createGuestDto.diet_tag_ids.length > 0) {
      const dietTags = await this.dietTagRepository.findByIds(
        createGuestDto.diet_tag_ids,
      );

      if (dietTags.length > 0) {
        user.diet_preferences = dietTags;
        await this.userRepository.save(user);
      }
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

  async validateGuestSession(guest_token: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { guest_token, is_guest: true },
    });

    if (!user) {
      throw new NotFoundException('Guest session not found');
    }

    if (user.expires_at && user.expires_at < new Date()) {
      throw new UnauthorizedException('Guest session expired');
    }

    // Update last activity
    user.last_activity_at = new Date();
    await this.userRepository.save(user);

    return user;
  }

  async convertGuestToUser(
    userId: string,
    convertDto: ConvertGuestDto,
  ): Promise<any> {
    const { email, password, first_name, last_name, avatar_url } = convertDto;

    // Find guest user
    const user = await this.userRepository.findOne({
      where: { id: userId, is_guest: true },
      relations: ['profile'],
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

    // Generate 6-digit verification code
    const verification_code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (15 minutes from now)
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 15);

    // Delete any existing verification codes for this user
    await this.emailVerificationRepository.delete({ user_id: userId });

    // Create verification record
    const verification = this.emailVerificationRepository.create({
      user_id: userId,
      email,
      verification_code,
      expires_at,
      is_verified: false,
    });

    await this.emailVerificationRepository.save(verification);

    // Hash password and temporarily store in user (but keep as guest)
    const password_hash = await bcrypt.hash(password, 10);
    user.password_hash = password_hash;
    user.email = email;

    await this.userRepository.save(user);

    // Update profile with name and photo
    let profile = user.profile;
    if (!profile) {
      profile = this.userProfileRepository.create({ user_id: userId });
    }

    if (first_name) profile.first_name = first_name;
    if (last_name) profile.last_name = last_name;
    if (avatar_url) profile.avatar_url = avatar_url;

    await this.userProfileRepository.save(profile);

    // Send verification email
    await this.emailService.sendVerificationCode(email, verification_code);

    return {
      message: 'Verification code sent to email',
      email,
      expires_at,
    };
  }

  async cleanupExpiredSessions(): Promise<number> {
    // Deactivate expired guest users (NEVER delete - preserve all user data)
    const result = await this.userRepository.update(
      {
        is_guest: true,
        expires_at: LessThan(new Date()),
        is_active: true,
      },
      {
        is_active: false,
      },
    );

    return result.affected || 0;
  }

  async verifyEmail(verifyDto: VerifyEmailDto): Promise<AuthResponse> {
    const { email, code } = verifyDto;

    // Find verification record
    const verification = await this.emailVerificationRepository.findOne({
      where: { email, verification_code: code },
      relations: ['user'],
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification code');
    }

    if (verification.is_verified) {
      throw new BadRequestException('Email already verified');
    }

    if (verification.expires_at < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    const user = verification.user;

    if (!user.is_guest) {
      throw new BadRequestException('User is already registered');
    }

    // Mark verification as complete
    verification.is_verified = true;
    verification.verified_at = new Date();
    await this.emailVerificationRepository.save(verification);

    // Convert guest to registered user
    user.auth_provider = AuthProvider.EMAIL;
    user.is_guest = false;
    user.email_verified = true;
    // Clear guest session data
    user.guest_token = null;
    user.device_id = null;
    user.device_type = null;
    user.ip_address = null;
    user.user_agent = null;
    user.expires_at = null;
    user.last_activity_at = null;

    await this.userRepository.save(user);

    // Send welcome email
    const profile = await this.userProfileRepository.findOne({
      where: { user_id: user.id },
    });
    if (user.email) {
      await this.emailService.sendWelcomeEmail(
        user.email,
        profile?.first_name || undefined,
      );
    }

    // Generate tokens for the newly registered user
    return this.generateTokens(user);
  }
}

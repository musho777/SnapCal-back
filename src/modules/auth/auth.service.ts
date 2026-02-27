import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { UserOAuthAccount } from '../users/entities/user-oauth-account.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthProvider } from '@/common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserOAuthAccount)
    private oauthRepository: Repository<UserOAuthAccount>,
    @InjectRepository(UserSettings)
    private settingsRepository: Repository<UserSettings>,
    private jwtService: JwtService,
    private configService: ConfigService,
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

    let user: User;

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
    return this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });
  }
}

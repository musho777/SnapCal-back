import { Module, DynamicModule, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { UserOAuthAccount } from '../users/entities/user-oauth-account.entity';
import { BodyMeasurement } from '../users/entities/body-measurement.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';
import { UserCalorieTarget } from '../settings/entities/user-calorie-target.entity';
import { DietTag } from '../diet-tags/entities/diet-tag.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { EmailService } from './services/email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

@Module({})
export class AuthModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      AuthService,
      EmailService,
      JwtStrategy,
    ];

    // Conditionally add Google Strategy
    providers.push({
      provide: GoogleStrategy,
      useFactory: (configService: ConfigService) => {
        const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

        // Only instantiate if credentials are provided
        if (clientId && clientSecret) {
          return new GoogleStrategy(configService);
        }

        // Return null if credentials missing - strategy won't be available
        return null;
      },
      inject: [ConfigService],
    });

    // Conditionally add Apple Strategy
    providers.push({
      provide: AppleStrategy,
      useFactory: (configService: ConfigService) => {
        const clientId = configService.get<string>('APPLE_CLIENT_ID');
        const teamId = configService.get<string>('APPLE_TEAM_ID');
        const keyId = configService.get<string>('APPLE_KEY_ID');

        // Only instantiate if credentials are provided
        if (clientId && teamId && keyId) {
          return new AppleStrategy(configService);
        }

        // Return null if credentials missing - strategy won't be available
        return null;
      },
      inject: [ConfigService],
    });

    // Conditionally add Facebook Strategy
    providers.push({
      provide: FacebookStrategy,
      useFactory: (configService: ConfigService) => {
        const appId = configService.get<string>('FACEBOOK_APP_ID');
        const appSecret = configService.get<string>('FACEBOOK_APP_SECRET');

        // Only instantiate if credentials are provided
        if (appId && appSecret) {
          return new FacebookStrategy(configService);
        }

        // Return null if credentials missing - strategy won't be available
        return null;
      },
      inject: [ConfigService],
    });

    return {
      module: AuthModule,
      imports: [
        TypeOrmModule.forFeature([
          User,
          UserProfile,
          UserOAuthAccount,
          BodyMeasurement,
          UserSettings,
          UserCalorieTarget,
          DietTag,
          EmailVerification,
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: config.get<string>('JWT_EXPIRATION'),
            },
          }),
        }),
        ConfigModule,
      ],
      controllers: [AuthController],
      providers,
      exports: [AuthService, JwtStrategy, PassportModule],
    };
  }
}

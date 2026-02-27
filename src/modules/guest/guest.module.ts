import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { GuestSession } from './entities/guest-session.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { BodyMeasurement } from '../users/entities/body-measurement.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';
import { UserCalorieTarget } from '../settings/entities/user-calorie-target.entity';
import { DietPreference } from '../diet-preferences/entities/diet-preference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GuestSession,
      User,
      UserProfile,
      BodyMeasurement,
      UserSettings,
      UserCalorieTarget,
      DietPreference,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION'),
        },
      }),
    }),
  ],
  controllers: [GuestController],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule {}

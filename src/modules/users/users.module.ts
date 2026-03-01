import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserOAuthAccount } from './entities/user-oauth-account.entity';
import { BodyMeasurement } from './entities/body-measurement.entity';
import { DietTag } from '../diet-tags/entities/diet-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      UserOAuthAccount,
      BodyMeasurement,
      DietTag,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

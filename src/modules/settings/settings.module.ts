import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { UserSettings } from './entities/user-settings.entity';
import { UserCalorieTarget } from './entities/user-calorie-target.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSettings, UserCalorieTarget])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

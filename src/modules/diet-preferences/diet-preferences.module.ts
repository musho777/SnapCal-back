import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietPreferencesController } from './diet-preferences.controller';
import { DietPreferencesService } from './diet-preferences.service';
import { DietPreference } from './entities/diet-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DietPreference])],
  controllers: [DietPreferencesController],
  providers: [DietPreferencesService],
  exports: [DietPreferencesService],
})
export class DietPreferencesModule {}

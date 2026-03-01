import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DietPreferencesController } from './diet-preferences.controller';
import { DietPreferencesService } from './diet-preferences.service';
import { User } from '../users/entities/user.entity';
import { DietTag } from '../diet-tags/entities/diet-tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, DietTag])],
  controllers: [DietPreferencesController],
  providers: [DietPreferencesService],
  exports: [DietPreferencesService],
})
export class DietPreferencesModule {}

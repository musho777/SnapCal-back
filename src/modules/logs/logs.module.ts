import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { UserDailyLog } from './entities/user-daily-log.entity';
import { BurnedDish } from './entities/burned-dish.entity';
import { Dish } from '../dishes/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserDailyLog, BurnedDish, Dish])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}

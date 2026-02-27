import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GuestModule } from '../../modules/guest/guest.module';

@Module({
  imports: [GuestModule],
  providers: [TasksService],
})
export class TasksModule {}

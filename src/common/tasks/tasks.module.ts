import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthModule } from '../../modules/auth/auth.module';

@Module({
  imports: [AuthModule.forRoot()],
  providers: [TasksService],
})
export class TasksModule {}

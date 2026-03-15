import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { AuthModule } from '../../modules/auth/auth.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { UserSettings } from '../../modules/settings/entities/user-settings.entity';

@Module({
  imports: [
    AuthModule.forRoot(),
    NotificationsModule,
    TypeOrmModule.forFeature([UserSettings]),
  ],
  providers: [TasksService],
})
export class TasksModule {}

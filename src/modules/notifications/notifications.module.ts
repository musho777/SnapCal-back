import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationTypesService } from './notification-types.service';
import { FcmService } from './services/fcm.service';
import { NotificationsController } from './notifications.controller';
import { NotificationTypesController } from './notification-types.controller';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationType } from './entities/notification-type.entity';
import { UserSettings } from '../settings/entities/user-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationPreference,
      NotificationType,
      UserSettings,
    ]),
    ConfigModule,
  ],
  controllers: [NotificationsController, NotificationTypesController],
  providers: [NotificationsService, NotificationTypesService, FcmService],
  exports: [NotificationsService, NotificationTypesService, FcmService],
})
export class NotificationsModule {}

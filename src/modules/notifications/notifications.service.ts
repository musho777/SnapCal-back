import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Notification } from "./entities/notification.entity";
import { NotificationPreference } from "./entities/notification-preference.entity";
import { NotificationType } from "./entities/notification-type.entity";
import { UserSettings } from "../settings/entities/user-settings.entity";
import { FcmService } from "./services/fcm.service";
import { SendNotificationDto } from "./dto/send-notification.dto";
import { UpdateNotificationPreferenceDto } from "./dto/update-preferences.dto";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(NotificationType)
    private notificationTypeRepository: Repository<NotificationType>,
    @InjectRepository(UserSettings)
    private settingsRepository: Repository<UserSettings>,
    private fcmService: FcmService,
  ) {}

  async sendNotification(
    userId: string,
    sendDto: SendNotificationDto,
  ): Promise<Notification | null> {
    const { notification_type_id, title, message, icon, icon_bg, icon_color } =
      sendDto;

    // Get notification type
    const notificationType = await this.notificationTypeRepository.findOne({
      where: { id: notification_type_id, is_active: true },
    });

    if (!notificationType) {
      throw new NotFoundException("Notification type not found or inactive");
    }

    // Check if user has this notification type enabled
    const isEnabled = await this.isNotificationEnabled(
      userId,
      notification_type_id,
    );

    // If notification is disabled, don't save it or send it
    if (!isEnabled) {
      this.logger.debug(
        `Notification type ${notification_type_id} is disabled for user ${userId}`,
      );
      return null;
    }

    // Create notification in DB only if enabled
    const notification = this.notificationRepository.create({
      user_id: userId,
      notification_type_id,
      title,
      message,
      icon: icon || notificationType.icon,
      icon_bg: icon_bg || notificationType.icon_bg,
      icon_color: icon_color || notificationType.icon_color,
      read: false,
    });

    await this.notificationRepository.save(notification);

    // Send FCM notification
    const settings = await this.settingsRepository.findOne({
      where: { user_id: userId },
    });

    if (settings?.fcm_token && settings.notifications_enabled) {
      console.log("11");
      await this.fcmService.sendNotification(
        settings.fcm_token,
        title,
        message,
        {
          notification_id: notification.id,
          type_id: notification_type_id,
        },
      );
    }

    return notification;
  }

  async sendBulkNotification(
    userIds: string[],
    sendDto: SendNotificationDto,
  ): Promise<{ sent: number; failed: number }> {
    const { notification_type_id, title, message, icon, icon_bg, icon_color } =
      sendDto;

    // Get notification type
    const notificationType = await this.notificationTypeRepository.findOne({
      where: { id: notification_type_id, is_active: true },
    });

    if (!notificationType) {
      throw new NotFoundException("Notification type not found or inactive");
    }

    let sent = 0;
    let failed = 0;
    const fcmTokens: string[] = [];

    for (const userId of userIds) {
      try {
        // Check if notification is enabled for user
        const isEnabled = await this.isNotificationEnabled(
          userId,
          notification_type_id,
        );

        // Skip if notification is disabled for this user
        if (!isEnabled) {
          this.logger.debug(
            `Notification type ${notification_type_id} is disabled for user ${userId}`,
          );
          continue;
        }

        // Create notification in DB only if enabled
        const notification = this.notificationRepository.create({
          user_id: userId,
          notification_type_id,
          title,
          message,
          icon: icon || notificationType.icon,
          icon_bg: icon_bg || notificationType.icon_bg,
          icon_color: icon_color || notificationType.icon_color,
          read: false,
        });

        await this.notificationRepository.save(notification);

        // Collect FCM tokens for enabled users
        const settings = await this.settingsRepository.findOne({
          where: { user_id: userId },
        });

        if (settings?.fcm_token && settings.notifications_enabled) {
          fcmTokens.push(settings.fcm_token);
        }

        sent++;
      } catch (error) {
        this.logger.error(
          `Failed to send notification to user ${userId}`,
          error,
        );
        failed++;
      }
    }

    // Send FCM multicast
    if (fcmTokens.length > 0) {
      await this.fcmService.sendMulticast(fcmTokens, title, message, {
        type_id: notification_type_id,
      });
    }

    return { sent, failed };
  }

  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    notificationType?: string,
    unread?: boolean,
  ) {
    const whereCondition: any = { user_id: userId };

    // Add type filter if provided
    if (notificationType) {
      whereCondition.notification_type_id = notificationType;
    }

    // Add unread filter if provided
    if (unread === true) {
      whereCondition.read = false;
    }

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: whereCondition,
        relations: ["notification_type"],
        order: { created_at: "DESC" },
        take: limit,
        skip: offset,
      });

    const unreadCount = await this.notificationRepository.count({
      where: { user_id: userId, read: false },
    });

    return {
      notifications,
      total,
      unread_count: unreadCount,
      limit,
      offset,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    notification.read = true;
    notification.read_at = new Date();

    await this.notificationRepository.save(notification);

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user_id: userId, read: false },
      { read: true, read_at: new Date() },
    );

    return { message: "All notifications marked as read" };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      user_id: userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException("Notification not found");
    }

    return { message: "Notification deleted successfully" };
  }

  async clearAllNotifications(userId: string) {
    const result = await this.notificationRepository.delete({
      user_id: userId,
    });

    return {
      message: "All notifications cleared successfully",
      deleted_count: result.affected || 0,
    };
  }

  async getPreferences(userId: string) {
    // Get all active notification types
    const allTypes = await this.notificationTypeRepository.find({
      where: { is_active: true },
    });

    // Get user preferences
    const preferences = await this.preferenceRepository.find({
      where: { user_id: userId },
      relations: ["notification_type"],
    });

    // Map types with user preferences
    const result = allTypes.map((type) => {
      const existing = preferences.find(
        (p) => p.notification_type_id === type.id,
      );
      return {
        id: type.id,
        name: type.name,
        label: type.label,
        icon: type.icon,
        icon_bg: type.icon_bg,
        icon_color: type.icon_color,
        is_enabled: existing ? existing.is_enabled : true,
        is_default: type.is_default,
      };
    });

    return result;
  }

  async updatePreference(
    userId: string,
    updateDto: UpdateNotificationPreferenceDto,
  ) {
    const { notification_type_id, is_enabled } = updateDto;

    // Verify notification type exists
    const notificationType = await this.notificationTypeRepository.findOne({
      where: { id: notification_type_id },
    });

    if (!notificationType) {
      throw new NotFoundException("Notification type not found");
    }

    let preference = await this.preferenceRepository.findOne({
      where: { user_id: userId, notification_type_id },
    });

    if (!preference) {
      preference = this.preferenceRepository.create({
        user_id: userId,
        notification_type_id,
        is_enabled,
      });
    } else {
      preference.is_enabled = is_enabled;
    }

    await this.preferenceRepository.save(preference);

    return {
      id: notificationType.id,
      name: notificationType.name,
      label: notificationType.label,
      icon: notificationType.icon,
      icon_bg: notificationType.icon_bg,
      icon_color: notificationType.icon_color,
      is_enabled: preference.is_enabled,
    };
  }

  async isNotificationEnabled(
    userId: string,
    notificationTypeId: string,
  ): Promise<boolean> {
    // Check global notification settings
    const settings = await this.settingsRepository.findOne({
      where: { user_id: userId },
    });

    if (!settings || !settings.notifications_enabled) {
      return false;
    }

    // Check type-specific preference
    const preference = await this.preferenceRepository.findOne({
      where: { user_id: userId, notification_type_id: notificationTypeId },
    });

    // If no preference exists, default to enabled
    return preference ? preference.is_enabled : true;
  }

  async cleanupOldNotifications(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.notificationRepository.delete({
      created_at: LessThan(cutoffDate),
    });

    const deletedCount = result.affected || 0;
    this.logger.log(`Cleaned up ${deletedCount} old notifications`);

    return deletedCount;
  }
}

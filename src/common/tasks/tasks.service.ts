import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull } from "typeorm";
import { AuthService } from "../../modules/auth/auth.service";
import { NotificationsService } from "../../modules/notifications/notifications.service";
import { UserSettings } from "../../modules/settings/entities/user-settings.entity";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private authService: AuthService,
    private notificationsService: NotificationsService,
    @InjectRepository(UserSettings)
    private settingsRepository: Repository<UserSettings>,
  ) {}

  /**
   * Aggregate daily statistics
   * Runs daily at 1:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async aggregateDailyStatistics() {
    this.logger.log("Starting daily statistics aggregation...");

    try {
      // Add your aggregation logic here
      // For example: calculate weekly/monthly summaries, trends, etc.
      this.logger.log("Daily statistics aggregation completed.");
    } catch (error) {
      this.logger.error("Error during statistics aggregation:", error);
    }
  }

  /**
   * Update dish average ratings
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async updateDishRatings() {
    this.logger.log("Starting dish ratings update...");

    try {
      // This could be moved to a batch process
      // For now, ratings are updated on-the-fly
      this.logger.log("Dish ratings update completed.");
    } catch (error) {
      this.logger.error("Error during dish ratings update:", error);
    }
  }

  /**
   * Send daily breakfast reminder
   * Runs every day at 8:00 AM
   */
  @Cron("*/10 * * * * *")
  // @Cron("0 8 * * *")
  async sendBreakfastReminder() {
    this.logger.log("Starting daily breakfast reminder...");

    try {
      // Get all users with FCM tokens and notifications enabled
      const usersWithFcm = await this.settingsRepository.find({
        where: {
          fcm_token: Not(IsNull()),
          notifications_enabled: true,
        },
      });

      if (usersWithFcm.length === 0) {
        this.logger.log("No users with FCM tokens found.");
        return;
      }

      const userIds = usersWithFcm.map((setting) => setting.user_id);

      // Send bulk notification
      const result = await this.notificationsService.sendBulkNotification(
        userIds,
        {
          notification_type_id: "cfd76970-eacb-4e2d-ae75-90dcf882b9de",
          title: "Time for Breakfast",
          message:
            "Don't skip your morning meal. Start your day with a nutritious breakfast to fuel your body and mind.",
        },
      );

      this.logger.log(
        `Breakfast reminder sent. Sent: ${result.sent}, Failed: ${result.failed}`,
      );
    } catch (error) {
      this.logger.error("Error during breakfast reminder:", error);
    }
  }
}

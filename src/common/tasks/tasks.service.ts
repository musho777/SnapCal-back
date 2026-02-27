import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GuestService } from '../../modules/guest/guest.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private guestService: GuestService) {}

  /**
   * Cleanup expired guest sessions
   * Runs daily at 2:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredGuestSessions() {
    this.logger.log('Starting cleanup of expired guest sessions...');

    try {
      const deletedCount = await this.guestService.cleanupExpiredSessions();
      this.logger.log(
        `Cleanup completed. Deleted ${deletedCount} expired guest sessions.`,
      );
    } catch (error) {
      this.logger.error('Error during guest session cleanup:', error);
    }
  }

  /**
   * Aggregate daily statistics
   * Runs daily at 1:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async aggregateDailyStatistics() {
    this.logger.log('Starting daily statistics aggregation...');

    try {
      // Add your aggregation logic here
      // For example: calculate weekly/monthly summaries, trends, etc.
      this.logger.log('Daily statistics aggregation completed.');
    } catch (error) {
      this.logger.error('Error during statistics aggregation:', error);
    }
  }

  /**
   * Update dish average ratings
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async updateDishRatings() {
    this.logger.log('Starting dish ratings update...');

    try {
      // This could be moved to a batch process
      // For now, ratings are updated on-the-fly
      this.logger.log('Dish ratings update completed.');
    } catch (error) {
      this.logger.error('Error during dish ratings update:', error);
    }
  }
}

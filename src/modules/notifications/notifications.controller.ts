import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by notification type ID' })
  @ApiQuery({ name: 'unread', required: false, type: Boolean, description: 'Filter by unread notifications only' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved' })
  async getUserNotifications(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('type') notificationType?: string,
    @Query('unread') unread?: string,
  ) {
    const numLimit = limit ? parseInt(limit, 10) : undefined;
    const numOffset = offset ? parseInt(offset, 10) : undefined;
    const onlyUnread = unread === 'true';
    return this.notificationsService.getUserNotifications(
      user.id,
      numLimit,
      numOffset,
      notificationType,
      onlyUnread,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send notification to current user' })
  @ApiResponse({ status: 201, description: 'Notification sent' })
  async sendNotification(
    @CurrentUser() user: User,
    @Body() sendDto: SendNotificationDto,
  ) {
    return this.notificationsService.sendNotification(user.id, sendDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send notification to multiple users (admin)' })
  @ApiResponse({ status: 201, description: 'Notifications sent' })
  async sendBulkNotification(@Body() sendDto: SendNotificationDto) {
    if (!sendDto.user_ids || sendDto.user_ids.length === 0) {
      return { message: 'No user IDs provided' };
    }
    return this.notificationsService.sendBulkNotification(
      sendDto.user_ids,
      sendDto,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(user.id, notificationId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(
    @CurrentUser() user: User,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(user.id, notificationId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all notifications' })
  @ApiResponse({ status: 200, description: 'All notifications cleared' })
  async clearAllNotifications(@CurrentUser() user: User) {
    return this.notificationsService.clearAllNotifications(user.id);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved' })
  async getPreferences(@CurrentUser() user: User) {
    return this.notificationsService.getPreferences(user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preference' })
  @ApiResponse({ status: 200, description: 'Preference updated' })
  async updatePreference(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationsService.updatePreference(user.id, updateDto);
  }
}

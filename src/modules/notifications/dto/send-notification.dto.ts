import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({ description: 'Notification type ID' })
  @IsUUID('4')
  notification_type_id: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ required: false, description: 'Custom icon (emoji), uses type default if not provided' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false, description: 'Custom icon background color' })
  @IsOptional()
  @IsString()
  icon_bg?: string;

  @ApiProperty({ required: false, description: 'Custom icon color' })
  @IsOptional()
  @IsString()
  icon_color?: string;

  @ApiProperty({ required: false, description: 'Specific user IDs to send to (if not provided, uses current user)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  user_ids?: string[];
}

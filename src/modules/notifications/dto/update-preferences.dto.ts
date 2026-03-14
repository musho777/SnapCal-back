import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @ApiProperty({ description: 'Notification type ID' })
  @IsUUID('4')
  notification_type_id: string;

  @ApiProperty({ description: 'Enable or disable this notification type' })
  @IsBoolean()
  is_enabled: boolean;
}

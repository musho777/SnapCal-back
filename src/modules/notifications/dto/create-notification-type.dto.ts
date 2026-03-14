import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateNotificationTypeDto {
  @ApiProperty({ description: 'Unique name for the type (e.g., meal_reminder)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Display label (e.g., Meal Reminder)' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'Icon emoji' })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({ description: 'Icon background color' })
  @IsString()
  @IsNotEmpty()
  icon_bg: string;

  @ApiProperty({ description: 'Icon color' })
  @IsString()
  @IsNotEmpty()
  icon_color: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';
import { Goal, ActivityLevel } from '@/common/enums';

export class UpdateSettingsDto {
  @ApiProperty({ required: false, enum: Goal })
  @IsOptional()
  @IsEnum(Goal)
  goal?: Goal;

  @ApiProperty({ required: false, enum: ActivityLevel })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activity_level?: ActivityLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  target_weight_kg?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notifications_enabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  dark_mode?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  measurement_system?: string;
}

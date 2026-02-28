import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateDailyLogDto {
  @ApiProperty()
  @IsDateString()
  log_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  calories_burned?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  water_intake_liters?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

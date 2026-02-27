import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateBodyMeasurementDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  weight_kg?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  height_cm?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  measured_at?: string;
}

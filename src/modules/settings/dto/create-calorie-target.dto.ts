import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsNumber, IsDateString, IsString } from 'class-validator';

export class CreateCalorieTargetDto {
  @ApiProperty()
  @IsDateString()
  target_date: string;

  @ApiProperty()
  @IsInt()
  target_calories: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  target_protein_g?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  target_carbs_g?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  target_fats_g?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

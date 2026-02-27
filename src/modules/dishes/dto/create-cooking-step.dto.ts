import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCookingStepDto {
  @ApiProperty()
  @IsNumber()
  step_number: number;

  @ApiProperty()
  @IsString()
  instruction: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image_url?: string;
}

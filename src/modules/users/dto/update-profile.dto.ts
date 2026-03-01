import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, IsUUID } from 'class-validator';
import { Gender } from '@/common/enums';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ required: false, enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  height_cm?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  current_weight_kg?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country_code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Array of diet tag IDs (vegetarian, vegan, gluten-free, etc.)'
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  diet_tag_ids?: string[];
}

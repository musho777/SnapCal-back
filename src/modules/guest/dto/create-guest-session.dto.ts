import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, IsUUID, IsIn } from 'class-validator';
import { Gender, Goal, ActivityLevel } from '@/common/enums';

export class CreateGuestSessionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  device_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  device_type?: string;

  @ApiProperty({ required: false, description: 'Date of birth for age calculation' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({ required: false, description: 'Height in centimeters' })
  @IsOptional()
  @IsNumber()
  height_cm?: number;

  @ApiProperty({ required: false, description: 'Weight in kilograms' })
  @IsOptional()
  @IsNumber()
  current_weight_kg?: number;

  @ApiProperty({ required: false, enum: Gender, description: 'User gender' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ required: false, enum: Goal, description: 'Main fitness goal' })
  @IsOptional()
  @IsEnum(Goal)
  goal?: Goal;

  @ApiProperty({ required: false, enum: ActivityLevel, description: 'Activity level' })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activity_level?: ActivityLevel;

  @ApiProperty({ required: false, description: 'Target weight in kilograms' })
  @IsOptional()
  @IsNumber()
  target_weight_kg?: number;

  @ApiProperty({ required: false, description: 'Target daily calories' })
  @IsOptional()
  @IsNumber()
  target_calories?: number;

  @ApiProperty({ required: false, description: 'Target daily protein in grams' })
  @IsOptional()
  @IsNumber()
  target_protein_g?: number;

  @ApiProperty({ required: false, description: 'Target daily carbs in grams' })
  @IsOptional()
  @IsNumber()
  target_carbs_g?: number;

  @ApiProperty({ required: false, description: 'Target daily fats in grams' })
  @IsOptional()
  @IsNumber()
  target_fats_g?: number;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Array of diet tag IDs (vegetarian, vegan, gluten-free, etc.)'
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  diet_tag_ids?: string[];

  @ApiProperty({
    required: false,
    enum: ['metric', 'imperial'],
    default: 'metric',
    description: 'Measurement system: metric (cm/kg) or imperial (ft/lbs)'
  })
  @IsOptional()
  @IsIn(['metric', 'imperial'])
  measurement_system?: string;
}

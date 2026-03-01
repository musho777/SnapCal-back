import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDishIngredientDto } from './create-dish-ingredient.dto';
import { CreateCookingStepDto } from './create-cooking-step.dto';

export class CreateDishDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  prep_time_minutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  cook_time_minutes?: number;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(1)
  servings: number;

  @ApiProperty()
  @IsNumber()
  calories: number;

  @ApiProperty()
  @IsNumber()
  protein_g: number;

  @ApiProperty()
  @IsNumber()
  carbs_g: number;

  @ApiProperty()
  @IsNumber()
  fats_g: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fiber_g?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sugar_g?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sodium_mg?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  category_ids?: string[];

  @ApiProperty({ required: false, type: [CreateDishIngredientDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDishIngredientDto)
  ingredients?: CreateDishIngredientDto[];

  @ApiProperty({ required: false, type: [CreateCookingStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCookingStepDto)
  cooking_steps?: CreateCookingStepDto[];
}

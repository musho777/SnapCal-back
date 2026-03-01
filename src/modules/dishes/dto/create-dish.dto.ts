import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
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
  @Transform(({ value }) => value ? Number(value) : undefined)
  prep_time_minutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? Number(value) : undefined)
  cook_time_minutes?: number;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  servings: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  calories: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  protein_g: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  carbs_g: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  fats_g: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? Number(value) : undefined)
  fiber_g?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? Number(value) : undefined)
  sugar_g?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? Number(value) : undefined)
  sodium_mg?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  is_public?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return JSON.parse(value);
    return undefined;
  })
  category_ids?: string[];

  @ApiProperty({ required: false, type: [CreateDishIngredientDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDishIngredientDto)
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return JSON.parse(value);
    return undefined;
  })
  ingredients?: CreateDishIngredientDto[];

  @ApiProperty({ required: false, type: [CreateCookingStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCookingStepDto)
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return JSON.parse(value);
    return undefined;
  })
  cooking_steps?: CreateCookingStepDto[];
}

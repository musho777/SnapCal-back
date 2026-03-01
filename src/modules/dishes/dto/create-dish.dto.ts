import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  ValidateNested,
  IsEnum,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { CreateDishIngredientDto } from "./create-dish-ingredient.dto";
import { CreateCookingStepDto } from "./create-cooking-step.dto";
import { DietTag } from "../../../common/enums/diet-tag.enum";

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
  @Transform(({ value }) => (value ? Number(value) : undefined))
  prep_time_minutes?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
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
  @Transform(({ value }) => (value ? Number(value) : undefined))
  fiber_g?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  sugar_g?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  sodium_mg?: number;

  @ApiProperty({ required: false, enum: DietTag, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(DietTag, { each: true })
  @Transform(({ value }) =>
    typeof value === "string" ? value.split(",").map((v) => v.trim()) : value,
  )
  diet_tags?: DietTag[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === "string" ? value.split(",").map((v) => v.trim()) : value,
  )
  category_ids?: string[];

  @ApiProperty({ required: false, type: [CreateDishIngredientDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDishIngredientDto)
  @Transform(({ value }) => {
    if (!value) return value;

    if (Array.isArray(value)) return value;

    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  ingredients?: CreateDishIngredientDto[];

  @ApiProperty({ required: false, type: [CreateCookingStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCookingStepDto)
  @Transform(({ value }) => {
    if (!value) return value;

    if (Array.isArray(value)) return value;

    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  cooking_steps?: CreateCookingStepDto[];
}

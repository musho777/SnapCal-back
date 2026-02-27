import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { MealType } from '@/common/enums';

export class AddDishToMealDto {
  @ApiProperty()
  @IsString()
  dish_id: string;

  @ApiProperty({ enum: MealType })
  @IsEnum(MealType)
  meal_type: MealType;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(0.1)
  servings: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

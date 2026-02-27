import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveDishFromMealDto {
  @ApiProperty()
  @IsString()
  meal_dish_id: string;
}

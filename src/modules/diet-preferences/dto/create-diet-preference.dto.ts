import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDietPreferenceDto {
  @ApiProperty({ example: 'vegetarian' })
  @IsString()
  preference_type: string;

  @ApiProperty({ example: 'strict' })
  @IsString()
  preference_value: string;
}

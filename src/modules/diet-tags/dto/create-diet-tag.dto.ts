import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateDietTagDto {
  @ApiProperty({
    example: 'vegetarian',
    description: 'Unique name of the diet tag',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'No meat or fish',
    description: 'Description of the diet tag',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: 'https://example.com/icons/vegetarian.png',
    description: 'URL or path to diet tag icon',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  icon_url?: string;
}

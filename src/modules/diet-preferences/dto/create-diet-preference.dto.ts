import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class CreateDietPreferenceDto {
  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: 'Array of diet tag IDs',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  diet_tag_ids: string[];
}

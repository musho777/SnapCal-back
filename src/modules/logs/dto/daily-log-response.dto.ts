import { ApiProperty } from '@nestjs/swagger';

export class DailyLogResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  user_id: string;

  @ApiProperty({ example: '2026-02-27' })
  log_date: string;

  @ApiProperty({
    example: 1850,
    description: 'Total calories consumed from all meals (automatically calculated)'
  })
  calories_consumed: number;

  @ApiProperty({
    example: 95.5,
    description: 'Total protein consumed in grams (automatically calculated)'
  })
  protein_consumed_g: number;

  @ApiProperty({
    example: 180.2,
    description: 'Total carbs consumed in grams (automatically calculated)'
  })
  carbs_consumed_g: number;

  @ApiProperty({
    example: 65.3,
    description: 'Total fats consumed in grams (automatically calculated)'
  })
  fats_consumed_g: number;

  @ApiProperty({
    example: 300,
    description: 'Calories burned through exercise/activity'
  })
  calories_burned: number;

  @ApiProperty({
    example: 2000,
    required: false,
    description: 'Daily calorie target for this date'
  })
  target_calories: number | null;

  @ApiProperty({
    example: 2.5,
    required: false,
    description: 'Water intake in liters'
  })
  water_intake_liters: number | null;

  @ApiProperty({
    example: 'Had a great workout today!',
    required: false
  })
  notes: string | null;

  @ApiProperty({
    example: '2026-02-27T10:00:00Z'
  })
  created_at: Date;

  @ApiProperty({
    example: '2026-02-27T15:30:00Z'
  })
  updated_at: Date;

  @ApiProperty({
    type: 'array',
    description: 'List of meals for this day',
    required: false
  })
  meals?: any[];
}

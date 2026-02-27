import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateGuestSessionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  device_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  device_type?: string;
}

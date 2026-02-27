import { PartialType } from '@nestjs/swagger';
import { CreateRatingDto } from './create-rating.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateRatingDto extends PartialType(
  OmitType(CreateRatingDto, ['dish_id'] as const),
) {}

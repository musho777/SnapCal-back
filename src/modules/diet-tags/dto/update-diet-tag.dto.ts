import { PartialType } from '@nestjs/swagger';
import { CreateDietTagDto } from './create-diet-tag.dto';

export class UpdateDietTagDto extends PartialType(CreateDietTagDto) {}

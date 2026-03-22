import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";

export class CreateDishCategoryDto {
  @ApiProperty({ description: "Category name", example: "Italian" })
  @IsString()
  name: string;

  @ApiProperty({
    description: "URL-friendly slug (unique identifier)",
    example: "italian",
  })
  @IsString()
  slug: string;

  @ApiProperty({
    required: false,
    description: "Category description",
    example: "Traditional Italian cuisine",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    default: 0,
    description: "Sort order for displaying categories",
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : 0))
  sort_order?: number;

  @ApiProperty({
    required: false,
    default: true,
    description: "Whether the category is active",
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  is_active?: boolean;
}

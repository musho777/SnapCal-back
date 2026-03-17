import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateDishCategoryDto {
  @ApiProperty({
    required: false,
    description: "Category name",
    example: "Italian",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
    description: "URL-friendly slug (unique identifier)",
    example: "italian",
  })
  @IsOptional()
  @IsString()
  slug?: string;

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
    description: "Sort order for displaying categories",
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  sort_order?: number;

  @ApiProperty({
    required: false,
    description: "Whether the category is active",
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { DishesService } from "./dishes.service";
import { CreateDishDto } from "./dto/create-dish.dto";
import { UpdateDishDto } from "./dto/update-dish.dto";
import { CreateDishIngredientDto } from "./dto/create-dish-ingredient.dto";
import { CreateCookingStepDto } from "./dto/create-cooking-step.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators";
import { User } from "../users/entities/user.entity";

@ApiTags("dishes")
@ApiExtraModels(
  CreateDishDto,
  CreateDishIngredientDto,
  CreateCookingStepDto,
  UpdateDishDto,
)
@Controller("dishes")
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  @ApiOperation({ summary: "Get all dishes" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Dishes retrieved" })
  async findAll(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const numLimit = limit ? parseInt(limit, 10) : undefined;
    const numOffset = offset ? parseInt(offset, 10) : undefined;
    return this.dishesService.findAll(numLimit, numOffset);
  }

  @Get("search")
  @ApiOperation({ summary: "Search dishes" })
  @ApiQuery({ name: "q", type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Search results" })
  async search(@Query("q") query: string, @Query("limit") limit?: string) {
    const numLimit = limit ? parseInt(limit, 10) : undefined;
    return this.dishesService.searchDishes(query, numLimit);
  }

  @Get("categories")
  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({ status: 200, description: "Categories retrieved" })
  async getCategories() {
    return this.dishesService.getCategories();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get dish by ID" })
  @ApiResponse({ status: 200, description: "Dish retrieved" })
  @ApiResponse({ status: 404, description: "Dish not found" })
  async findOne(@Param("id") id: string) {
    return this.dishesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: require("multer").diskStorage({
        destination: "./uploads/dishes",
        filename: (req, file, callback) => {
          const uniqueName = `${require("uuid").v4()}${require("path").extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error("Only image files are allowed"), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Create new dish with image and complete data",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["name", "servings", "calories", "protein_g", "carbs_g", "fats_g"],
      properties: {
        image: {
          type: "string",
          format: "binary",
        },
        name: {
          type: "string",
          example: "Grilled Chicken Salad",
        },
        description: {
          type: "string",
          example: "Healthy grilled chicken with mixed greens",
        },
        prep_time_minutes: {
          type: "number",
          example: 15,
        },
        cook_time_minutes: {
          type: "number",
          example: 20,
        },
        servings: {
          type: "number",
          example: 2,
        },
        calories: {
          type: "number",
          example: 350,
        },
        protein_g: {
          type: "number",
          example: 42,
        },
        carbs_g: {
          type: "number",
          example: 18,
        },
        fats_g: {
          type: "number",
          example: 12,
        },
        fiber_g: {
          type: "number",
          example: 4,
        },
        sugar_g: {
          type: "number",
          example: 6,
        },
        sodium_mg: {
          type: "number",
          example: 450,
        },
        is_public: {
          type: "boolean",
          example: true,
        },
        category_ids: {
          type: "array",
          items: {
            type: "string",
          },
          example: ["10000006-0000-4000-8000-000000000006"],
        },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              quantity: {
                type: "string",
              },
              unit: {
                type: "string",
              },
              sort_order: {
                type: "number",
              },
              is_optional: {
                type: "boolean",
              },
            },
          },
          example: [{"name":"Chicken breast","quantity":"200","unit":"g","sort_order":1,"is_optional":false}],
        },
        cooking_steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              step_number: {
                type: "number",
              },
              instruction: {
                type: "string",
              },
              duration_minutes: {
                type: "number",
              },
              image_url: {
                type: "string",
              },
            },
          },
          example: [{"step_number":1,"instruction":"Season chicken breast with salt and pepper","duration_minutes":5}],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Dish created successfully" })
  async create(
    @CurrentUser() user: User,
    @Body() createDto: CreateDishDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.dishesService.create(user.id, createDto, image);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("image", {
      storage: require("multer").diskStorage({
        destination: "./uploads/dishes",
        filename: (req, file, callback) => {
          const uniqueName = `${require("uuid").v4()}${require("path").extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error("Only image files are allowed"), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Update complete dish with optional new image",
    description: `
    Update a dish with optional new image. **WARNING:** Ingredients and cooking steps will be REPLACED if provided.

    **How to use:**
    1. Optionally upload a new image file
    2. Provide updated dish data as a JSON string in the "data" field

    **Example JSON for data field:**
    \`\`\`json
    {
      "name": "Updated Grilled Chicken Salad",
      "description": "Updated description",
      "prep_time_minutes": 15,
      "cook_time_minutes": 20,
      "servings": 2,
      "calories": 350,
      "protein_g": 42,
      "carbs_g": 18,
      "fats_g": 12,
      "fiber_g": 4,
      "sugar_g": 6,
      "sodium_mg": 450,
      "is_public": true,
      "category_ids": ["10000002-0000-4000-8000-000000000002"],
      "ingredients": [
        {
          "name": "Chicken breast",
          "quantity": "250",
          "unit": "g",
          "sort_order": 1,
          "is_optional": false
        }
      ],
      "cooking_steps": [
        {
          "step_number": 1,
          "instruction": "Season chicken breast with herbs",
          "duration_minutes": 5
        },
        {
          "step_number": 2,
          "instruction": "Grill chicken until cooked",
          "duration_minutes": 15
        }
      ]
    }
    \`\`\`

    **All fields are OPTIONAL for updates:**

    **Basic fields:**
    - name (string): Dish name
    - description (string): Dish description
    - servings (number): Number of servings
    - calories (number): Calories per serving
    - protein_g (number): Protein in grams
    - carbs_g (number): Carbohydrates in grams
    - fats_g (number): Fats in grams
    - prep_time_minutes (number): Preparation time
    - cook_time_minutes (number): Cooking time
    - fiber_g (number): Fiber in grams
    - sugar_g (number): Sugar in grams
    - sodium_mg (number): Sodium in milligrams
    - is_public (boolean): Make dish public
    - category_ids (array of strings): Category UUIDs

    **⚠️ WARNING - REPLACE Behavior:**
    - ingredients (array): REPLACES all existing ingredients
    - cooking_steps (array): REPLACES all existing cooking steps

    If you don't provide ingredients or cooking_steps, existing ones remain unchanged.
    `,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
          description: "OPTIONAL: New dish image file",
        },
        name: {
          type: "string",
          example: "Updated Grilled Chicken Salad",
        },
        description: {
          type: "string",
          example: "Updated description",
        },
        prep_time_minutes: {
          type: "number",
          example: 15,
        },
        cook_time_minutes: {
          type: "number",
          example: 20,
        },
        servings: {
          type: "number",
          example: 2,
        },
        calories: {
          type: "number",
          example: 360,
        },
        protein_g: {
          type: "number",
          example: 45,
        },
        carbs_g: {
          type: "number",
          example: 20,
        },
        fats_g: {
          type: "number",
          example: 13,
        },
        fiber_g: {
          type: "number",
          example: 4,
        },
        sugar_g: {
          type: "number",
          example: 6,
        },
        sodium_mg: {
          type: "number",
          example: 450,
        },
        is_public: {
          type: "boolean",
          example: true,
        },
        category_ids: {
          type: "array",
          items: {
            type: "string",
          },
          example: ["10000002-0000-4000-8000-000000000002"],
        },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              quantity: {
                type: "string",
              },
              unit: {
                type: "string",
              },
              sort_order: {
                type: "number",
              },
              is_optional: {
                type: "boolean",
              },
            },
          },
          example: [{"name":"Chicken breast","quantity":"250","unit":"g","sort_order":1}],
        },
        cooking_steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              step_number: {
                type: "number",
              },
              instruction: {
                type: "string",
              },
              duration_minutes: {
                type: "number",
              },
              image_url: {
                type: "string",
              },
            },
          },
          example: [{"step_number":1,"instruction":"Season and grill chicken","duration_minutes":20}],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Dish updated successfully" })
  async update(
    @Param("id") id: string,
    @CurrentUser() user: User,
    @Body() updateDto: UpdateDishDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.dishesService.update(id, user.id, updateDto, image);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete dish" })
  @ApiResponse({ status: 200, description: "Dish deleted" })
  async delete(@Param("id") id: string, @CurrentUser() user: User) {
    return this.dishesService.delete(id, user.id);
  }
}

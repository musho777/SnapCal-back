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
import { CreateDishCategoryDto } from "./dto/create-dish-category.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators";
import { User } from "../users/entities/user.entity";

@ApiTags("dishes")
@ApiExtraModels(
  CreateDishDto,
  CreateDishIngredientDto,
  CreateCookingStepDto,
  CreateDishCategoryDto,
  UpdateDishDto,
)
@Controller("dishes")
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  @ApiOperation({ summary: "Get all dishes or search dishes" })
  @ApiQuery({
    name: "q",
    required: false,
    type: String,
    description: "Search query for dish name or description",
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Dishes retrieved" })
  async findAll(
    @Query("q") query?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const numLimit = limit ? parseInt(limit, 10) : undefined;
    const numOffset = offset ? parseInt(offset, 10) : undefined;

    // If query parameter is provided, search dishes
    if (query) {
      return this.dishesService.searchDishes(query, numLimit);
    }

    // Otherwise, return all dishes with pagination
    return this.dishesService.findAll(numLimit, numOffset);
  }

  @Get("categories")
  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({ status: 200, description: "Categories retrieved" })
  async getCategories() {
    return this.dishesService.getCategories();
  }

  @Post("categories")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor("icon", {
      storage: require("multer").diskStorage({
        destination: "./uploads/categories",
        filename: (req, file, callback) => {
          const uniqueName = `${require("uuid").v4()}${require("path").extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
          return callback(new Error("Only image files are allowed"), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Create new category with icon" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["name", "slug"],
      properties: {
        icon: {
          type: "string",
          format: "binary",
          description: "Category icon image",
        },
        name: {
          type: "string",
          example: "Italian",
        },
        slug: {
          type: "string",
          example: "italian",
        },
        description: {
          type: "string",
          example: "Traditional Italian cuisine",
        },
        icon_url: {
          type: "string",
          example: "https://example.com/icons/italian.png",
        },
        sort_order: {
          type: "number",
          example: 11,
        },
        is_active: {
          type: "boolean",
          example: true,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Category created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input" })
  async createCategory(
    @Body() createDto: CreateDishCategoryDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    return this.dishesService.createCategory(createDto, icon);
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
      required: [
        "name",
        "servings",
        "calories",
        "protein_g",
        "carbs_g",
        "fats_g",
      ],
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
        diet_tags: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "vegetarian",
              "vegan",
              "pescatarian",
              "keto",
              "paleo",
              "gluten-free",
              "dairy-free",
            ],
          },
          example: ["vegetarian", "gluten-free"],
        },
        dish_type: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "breakfast",
              "lunch",
              "dinner",
              "snack",
              "dessert",
              "appetizer",
            ],
          },
          example: ["breakfast", "lunch"],
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
          example: [
            {
              name: "Chicken breast",
              quantity: "200",
              unit: "g",
              sort_order: 1,
              is_optional: false,
            },
          ],
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
          example: [
            {
              step_number: 1,
              instruction: "Season chicken breast with salt and pepper",
              duration_minutes: 5,
            },
          ],
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
    console.log(createDto, "createDtocreateDto");
    return this.dishesService.create(user.id, createDto, image);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
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
    summary: "Update dish with image and complete data",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: [
        "name",
        "servings",
        "calories",
        "protein_g",
        "carbs_g",
        "fats_g",
      ],
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
        diet_tags: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "vegetarian",
              "vegan",
              "pescatarian",
              "keto",
              "paleo",
              "gluten-free",
              "dairy-free",
            ],
          },
          example: ["vegetarian", "gluten-free"],
        },
        dish_type: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "breakfast",
              "lunch",
              "dinner",
              "snack",
              "dessert",
              "appetizer",
            ],
          },
          example: ["breakfast", "lunch"],
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
          example: [
            {
              name: "Chicken breast",
              quantity: "200",
              unit: "g",
              sort_order: 1,
              is_optional: false,
            },
          ],
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
          example: [
            {
              step_number: 1,
              instruction: "Season chicken breast with salt and pepper",
              duration_minutes: 5,
            },
          ],
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

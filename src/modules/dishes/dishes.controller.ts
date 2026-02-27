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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { CreateDishIngredientDto } from './dto/create-dish-ingredient.dto';
import { CreateCookingStepDto } from './dto/create-cooking-step.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all dishes' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Dishes retrieved' })
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const numLimit = limit ? parseInt(limit, 10) : undefined;
    const numOffset = offset ? parseInt(offset, 10) : undefined;
    return this.dishesService.findAll(numLimit, numOffset);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search dishes' })
  @ApiQuery({ name: 'q', type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Query('q') query: string, @Query('limit') limit?: string) {
    const numLimit = limit ? parseInt(limit, 10) : undefined;
    return this.dishesService.searchDishes(query, numLimit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async getCategories() {
    return this.dishesService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dish by ID' })
  @ApiResponse({ status: 200, description: 'Dish retrieved' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  async findOne(@Param('id') id: string) {
    return this.dishesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new dish' })
  @ApiResponse({ status: 201, description: 'Dish created' })
  async create(@CurrentUser() user: User, @Body() createDto: CreateDishDto) {
    return this.dishesService.create(user.id, createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update dish' })
  @ApiResponse({ status: 200, description: 'Dish updated' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateDto: UpdateDishDto,
  ) {
    return this.dishesService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete dish' })
  @ApiResponse({ status: 200, description: 'Dish deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.dishesService.delete(id, user.id);
  }

  @Post(':id/ingredients')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add ingredient to dish' })
  @ApiResponse({ status: 201, description: 'Ingredient added' })
  async addIngredient(
    @Param('id') dishId: string,
    @Body() createDto: CreateDishIngredientDto,
  ) {
    return this.dishesService.addIngredient(dishId, createDto);
  }

  @Post(':id/cooking-steps')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add cooking step to dish' })
  @ApiResponse({ status: 201, description: 'Cooking step added' })
  async addCookingStep(
    @Param('id') dishId: string,
    @Body() createDto: CreateCookingStepDto,
  ) {
    return this.dishesService.addCookingStep(dishId, createDto);
  }
}

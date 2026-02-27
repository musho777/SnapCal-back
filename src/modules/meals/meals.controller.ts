import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { AddDishToMealDto } from './dto/add-dish-to-meal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('meals')
@Controller('meals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post('add-dish')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add dish to meal (processes meal algorithm)' })
  @ApiResponse({ status: 201, description: 'Dish added to meal' })
  async addDishToMeal(
    @CurrentUser() user: User,
    @Body() addDto: AddDishToMealDto,
  ) {
    return this.mealsService.addDishToMeal(user.id, addDto);
  }

  @Delete('dish/:mealDishId')
  @ApiOperation({ summary: 'Remove dish from meal' })
  @ApiResponse({ status: 200, description: 'Dish removed from meal' })
  async removeDishFromMeal(
    @CurrentUser() user: User,
    @Param('mealDishId') mealDishId: string,
  ) {
    return this.mealsService.removeDishFromMeal(user.id, mealDishId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal by ID' })
  @ApiResponse({ status: 200, description: 'Meal retrieved' })
  async getMeal(@Param('id') mealId: string) {
    return this.mealsService.getMeal(mealId);
  }
}

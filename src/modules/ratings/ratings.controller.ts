import {
  Controller,
  Get,
  Post,
  Put,
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
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('ratings')
@Controller('ratings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update dish rating' })
  @ApiResponse({ status: 201, description: 'Rating created/updated' })
  async createOrUpdateRating(
    @CurrentUser() user: User,
    @Body() createDto: CreateRatingDto,
  ) {
    return this.ratingsService.createOrUpdateRating(user.id, createDto);
  }

  @Get('my-ratings')
  @ApiOperation({ summary: 'Get current user ratings' })
  @ApiResponse({ status: 200, description: 'Ratings retrieved' })
  async getUserRatings(@CurrentUser() user: User) {
    return this.ratingsService.getUserRatings(user.id);
  }

  @Get('dish/:dishId')
  @ApiOperation({ summary: 'Get ratings for specific dish' })
  @ApiResponse({ status: 200, description: 'Ratings retrieved' })
  async getDishRatings(@Param('dishId') dishId: string) {
    return this.ratingsService.getDishRatings(dishId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update rating' })
  @ApiResponse({ status: 200, description: 'Rating updated' })
  async updateRating(
    @CurrentUser() user: User,
    @Param('id') ratingId: string,
    @Body() updateDto: UpdateRatingDto,
  ) {
    return this.ratingsService.updateRating(user.id, ratingId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete rating' })
  @ApiResponse({ status: 200, description: 'Rating deleted' })
  async deleteRating(
    @CurrentUser() user: User,
    @Param('id') ratingId: string,
  ) {
    return this.ratingsService.deleteRating(user.id, ratingId);
  }
}

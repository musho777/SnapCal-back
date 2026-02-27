import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DishRating } from './entities/dish-rating.entity';
import { Dish } from '../dishes/entities/dish.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(DishRating)
    private ratingRepository: Repository<DishRating>,
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
  ) {}

  async createOrUpdateRating(userId: string, createDto: CreateRatingDto) {
    const { dish_id, rating, review } = createDto;

    // Check if dish exists
    const dish = await this.dishRepository.findOne({ where: { id: dish_id } });
    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    // Check if user already rated this dish
    let dishRating = await this.ratingRepository.findOne({
      where: { user_id: userId, dish_id },
    });

    if (dishRating) {
      // Update existing rating
      dishRating.rating = rating;
      if (review !== undefined) {
        dishRating.review = review;
      }
    } else {
      // Create new rating
      dishRating = this.ratingRepository.create({
        user_id: userId,
        dish_id,
        rating,
        review: review || null,
      });
    }

    await this.ratingRepository.save(dishRating);

    // Update dish average rating
    await this.updateDishAverageRating(dish_id);

    return dishRating;
  }

  async updateRating(userId: string, ratingId: string, updateDto: UpdateRatingDto) {
    const dishRating = await this.ratingRepository.findOne({
      where: { id: ratingId, user_id: userId },
    });

    if (!dishRating) {
      throw new NotFoundException('Rating not found');
    }

    if (updateDto.rating !== undefined) {
      dishRating.rating = updateDto.rating;
    }

    if (updateDto.review !== undefined) {
      dishRating.review = updateDto.review;
    }

    await this.ratingRepository.save(dishRating);

    // Update dish average rating
    await this.updateDishAverageRating(dishRating.dish_id);

    return dishRating;
  }

  async deleteRating(userId: string, ratingId: string) {
    const dishRating = await this.ratingRepository.findOne({
      where: { id: ratingId, user_id: userId },
    });

    if (!dishRating) {
      throw new NotFoundException('Rating not found');
    }

    const dishId = dishRating.dish_id;

    await this.ratingRepository.delete(ratingId);

    // Update dish average rating
    await this.updateDishAverageRating(dishId);

    return { message: 'Rating deleted successfully' };
  }

  async getUserRatings(userId: string) {
    const ratings = await this.ratingRepository.find({
      where: { user_id: userId },
      relations: ['dish'],
      order: { created_at: 'DESC' },
    });

    return ratings;
  }

  async getDishRatings(dishId: string) {
    const ratings = await this.ratingRepository.find({
      where: { dish_id: dishId },
      order: { created_at: 'DESC' },
    });

    return ratings;
  }

  private async updateDishAverageRating(dishId: string) {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'avg')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.dish_id = :dishId', { dishId })
      .getRawOne();

    const dish = await this.dishRepository.findOne({ where: { id: dishId } });

    if (dish) {
      dish.average_rating = result.avg ? parseFloat(result.avg) : 0;
      dish.rating_count = result.count ? parseInt(result.count) : 0;
      await this.dishRepository.save(dish);
    }
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Dish } from './entities/dish.entity';
import { DishCategory } from './entities/dish-category.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { DishCookingStep } from './entities/dish-cooking-step.entity';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { CreateDishIngredientDto } from './dto/create-dish-ingredient.dto';
import { CreateCookingStepDto } from './dto/create-cooking-step.dto';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    @InjectRepository(DishCategory)
    private categoryRepository: Repository<DishCategory>,
    @InjectRepository(DishIngredient)
    private ingredientRepository: Repository<DishIngredient>,
    @InjectRepository(DishCookingStep)
    private cookingStepRepository: Repository<DishCookingStep>,
  ) {}

  async findAll(limit: number = 50, offset: number = 0) {
    const [dishes, total] = await this.dishRepository.findAndCount({
      where: { is_active: true, is_public: true },
      relations: ['categories'],
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });

    return {
      dishes,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const dish = await this.dishRepository.findOne({
      where: { id, is_active: true },
      relations: ['categories', 'ingredients', 'cooking_steps'],
    });

    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    return dish;
  }

  async create(userId: string, createDto: CreateDishDto) {
    const { category_ids, ...dishData } = createDto;

    // Create dish
    const dish = this.dishRepository.create({
      ...dishData,
      created_by: userId,
    });

    // Add categories if provided
    if (category_ids && category_ids.length > 0) {
      const categories = await this.categoryRepository.findBy({
        id: In(category_ids),
      });
      dish.categories = categories;
    }

    await this.dishRepository.save(dish);

    return dish;
  }

  async update(id: string, userId: string, updateDto: UpdateDishDto) {
    const dish = await this.dishRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    // Only creator can update
    if (dish.created_by !== userId) {
      throw new ForbiddenException('You can only update your own dishes');
    }

    const { category_ids, ...dishData } = updateDto;

    Object.assign(dish, dishData);

    // Update categories if provided
    if (category_ids) {
      const categories = await this.categoryRepository.findBy({
        id: In(category_ids),
      });
      dish.categories = categories;
    }

    await this.dishRepository.save(dish);

    return dish;
  }

  async delete(id: string, userId: string) {
    const dish = await this.dishRepository.findOne({ where: { id } });

    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    if (dish.created_by !== userId) {
      throw new ForbiddenException('You can only delete your own dishes');
    }

    // Soft delete
    dish.is_active = false;
    await this.dishRepository.save(dish);

    return { message: 'Dish deleted successfully' };
  }

  async addIngredient(dishId: string, createDto: CreateDishIngredientDto) {
    const dish = await this.dishRepository.findOne({ where: { id: dishId } });

    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    const ingredient = this.ingredientRepository.create({
      dish_id: dishId,
      ...createDto,
    });

    await this.ingredientRepository.save(ingredient);

    return ingredient;
  }

  async addCookingStep(dishId: string, createDto: CreateCookingStepDto) {
    const dish = await this.dishRepository.findOne({ where: { id: dishId } });

    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    const step = this.cookingStepRepository.create({
      dish_id: dishId,
      ...createDto,
    });

    await this.cookingStepRepository.save(step);

    return step;
  }

  async getCategories() {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  async searchDishes(query: string, limit: number = 20) {
    const dishes = await this.dishRepository
      .createQueryBuilder('dish')
      .where('dish.is_active = :isActive', { isActive: true })
      .andWhere('dish.is_public = :isPublic', { isPublic: true })
      .andWhere(
        '(dish.name ILIKE :query OR dish.description ILIKE :query)',
        { query: `%${query}%` },
      )
      .leftJoinAndSelect('dish.categories', 'categories')
      .take(limit)
      .getMany();

    return dishes;
  }
}

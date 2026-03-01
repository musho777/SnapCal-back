import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Dish } from "./entities/dish.entity";
import { DishCategory } from "./entities/dish-category.entity";
import { DishIngredient } from "./entities/dish-ingredient.entity";
import { DishCookingStep } from "./entities/dish-cooking-step.entity";
import { CreateDishDto } from "./dto/create-dish.dto";
import { UpdateDishDto } from "./dto/update-dish.dto";
import { CreateDishCategoryDto } from "./dto/create-dish-category.dto";

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
      relations: ["categories"],
      take: limit,
      skip: offset,
      order: { created_at: "DESC" },
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
      relations: ["categories", "ingredients", "cooking_steps"],
    });

    if (!dish) {
      throw new NotFoundException("Dish not found");
    }

    return dish;
  }

  async create(
    userId: string,
    createDto: CreateDishDto,
    image?: Express.Multer.File,
  ) {
    const { category_ids, ingredients, cooking_steps, ...dishData } = createDto;
    const dish = this.dishRepository.create({
      ...dishData,
      created_by: userId,
      image_url: image
        ? `/uploads/dishes/${image.filename}`
        : dishData.image_url,
    });

    // Add categories if provided
    if (category_ids && category_ids.length > 0) {
      const categories = await this.categoryRepository.findBy({
        id: In(category_ids),
      });
      dish.categories = categories;
    }

    await this.dishRepository.save(dish);

    // Add ingredients if provided
    if (ingredients && ingredients.length > 0) {
      const ingredientEntities = ingredients.map((ing, index) =>
        this.ingredientRepository.create({
          dish_id: dish.id,
          ...ing,
          sort_order: ing.sort_order ?? index + 1,
        }),
      );
      await this.ingredientRepository.save(ingredientEntities);
    }

    // Add cooking steps if provided
    if (cooking_steps && cooking_steps.length > 0) {
      const stepEntities = cooking_steps.map((step) =>
        this.cookingStepRepository.create({
          dish_id: dish.id,
          ...step,
        }),
      );
      await this.cookingStepRepository.save(stepEntities);
    }

    // Return dish with relations
    return this.findOne(dish.id);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateDishDto,
    image?: Express.Multer.File,
  ) {
    const dish = await this.dishRepository.findOne({
      where: { id },
      relations: ["categories", "ingredients", "cooking_steps"],
    });

    if (!dish) {
      throw new NotFoundException("Dish not found");
    }

    // Only creator can update
    if (dish.created_by !== userId) {
      throw new ForbiddenException("You can only update your own dishes");
    }

    const { category_ids, ingredients, cooking_steps, ...dishData } = updateDto;

    Object.assign(dish, dishData);

    // Update image if new one is provided
    if (image) {
      dish.image_url = `/uploads/dishes/${image.filename}`;
    }

    // Update categories if provided
    if (category_ids) {
      const categories = await this.categoryRepository.findBy({
        id: In(category_ids),
      });
      dish.categories = categories;
    }

    // Replace ingredients if provided
    if (ingredients !== undefined) {
      // Delete existing ingredients
      await this.ingredientRepository.delete({ dish_id: id });

      // Create new ingredients
      if (ingredients.length > 0) {
        const ingredientEntities = ingredients.map((ing, index) =>
          this.ingredientRepository.create({
            dish_id: id,
            ...ing,
            sort_order: ing.sort_order ?? index + 1,
          }),
        );
        await this.ingredientRepository.save(ingredientEntities);
      }
    }

    // Replace cooking steps if provided
    if (cooking_steps !== undefined) {
      // Delete existing cooking steps
      await this.cookingStepRepository.delete({ dish_id: id });

      // Create new cooking steps
      if (cooking_steps.length > 0) {
        const stepEntities = cooking_steps.map((step) =>
          this.cookingStepRepository.create({
            dish_id: id,
            ...step,
          }),
        );
        await this.cookingStepRepository.save(stepEntities);
      }
    }

    await this.dishRepository.save(dish);

    // Return updated dish with all relations
    return this.findOne(id);
  }

  async delete(id: string, userId: string) {
    const dish = await this.dishRepository.findOne({ where: { id } });

    if (!dish) {
      throw new NotFoundException("Dish not found");
    }

    if (dish.created_by !== userId) {
      throw new ForbiddenException("You can only delete your own dishes");
    }

    // Soft delete
    dish.is_active = false;
    await this.dishRepository.save(dish);

    return { message: "Dish deleted successfully" };
  }

  async getCategories() {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: { sort_order: "ASC" },
    });
  }

  async createCategory(
    createDto: CreateDishCategoryDto,
    icon?: Express.Multer.File,
  ) {
    const category = this.categoryRepository.create({
      ...createDto,
      icon_url: icon
        ? `/uploads/categories/${icon.filename}`
        : createDto.icon_url,
    });
    return this.categoryRepository.save(category);
  }

  async searchDishes(query: string, limit: number = 20) {
    const dishes = await this.dishRepository
      .createQueryBuilder("dish")
      .where("dish.is_active = :isActive", { isActive: true })
      .andWhere("dish.is_public = :isPublic", { isPublic: true })
      .andWhere("(dish.name ILIKE :query OR dish.description ILIKE :query)", {
        query: `%${query}%`,
      })
      .leftJoinAndSelect("dish.categories", "categories")
      .take(limit)
      .getMany();

    return dishes;
  }
}

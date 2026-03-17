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
import { DietTag } from "../diet-tags/entities/diet-tag.entity";
import { SavedDish } from "./entities/saved-dish.entity";
import { CreateDishDto } from "./dto/create-dish.dto";
import { UpdateDishDto } from "./dto/update-dish.dto";
import { CreateDishCategoryDto } from "./dto/create-dish-category.dto";
import { UpdateDishCategoryDto } from "./dto/update-dish-category.dto";

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
    @InjectRepository(DietTag)
    private dietTagRepository: Repository<DietTag>,
    @InjectRepository(SavedDish)
    private savedDishRepository: Repository<SavedDish>,
  ) {}

  async findAll(
    limit: number = 50,
    offset: number = 0,
    dishType?: string,
    categoryIds?: string[],
    userId?: string,
  ) {
    const queryBuilder = this.dishRepository
      .createQueryBuilder("dish")
      .where("dish.is_active = :isActive", { isActive: true })
      .andWhere("dish.is_public = :isPublic", { isPublic: true })
      .leftJoinAndSelect("dish.categories", "categories")
      .leftJoinAndSelect("dish.diet_tags", "diet_tags")
      .orderBy("dish.created_at", "DESC")
      .take(limit)
      .skip(offset);

    // Add dish_type filter if provided
    if (dishType) {
      queryBuilder.andWhere(
        "dish.dish_type IS NOT NULL AND :dishType = ANY(dish.dish_type)",
        { dishType },
      );
    }

    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere("categories.id IN (:...categoryIds)", {
        categoryIds,
      });
    }

    const [dishes, total] = await queryBuilder.getManyAndCount();

    // Add is_saved field if user is authenticated
    const dishesWithSavedStatus = userId
      ? await this.addIsSavedField(dishes, userId)
      : dishes;

    return {
      dishes: dishesWithSavedStatus,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string, userId?: string) {
    const dish = await this.dishRepository.findOne({
      where: { id, is_active: true },
      relations: ["categories", "diet_tags", "ingredients", "cooking_steps"],
    });

    if (!dish) {
      throw new NotFoundException("Dish not found");
    }

    // Add is_saved field if user is authenticated
    if (userId) {
      const is_saved = await this.isSaved(userId, dish.id);
      return { ...dish, is_saved };
    }

    return dish;
  }

  async create(
    userId: string,
    createDto: CreateDishDto,
    image?: Express.Multer.File,
  ) {
    const {
      category_ids,
      diet_tag_ids,
      ingredients,
      cooking_steps,
      ...dishData
    } = createDto;
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

    // Add diet tags if provided
    if (diet_tag_ids && diet_tag_ids.length > 0) {
      const dietTags = await this.dietTagRepository.findBy({
        id: In(diet_tag_ids),
      });
      dish.diet_tags = dietTags;
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
    return this.findOne(dish.id, userId);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateDishDto,
    image?: Express.Multer.File,
  ) {
    const dish = await this.dishRepository.findOne({
      where: { id },
      relations: ["categories", "diet_tags", "ingredients", "cooking_steps"],
    });

    if (!dish) {
      throw new NotFoundException("Dish not found");
    }

    // Only creator can update
    if (dish.created_by !== userId) {
      throw new ForbiddenException("You can only update your own dishes");
    }

    const {
      category_ids,
      diet_tag_ids,
      ingredients,
      cooking_steps,
      ...dishData
    } = updateDto;

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

    // Update diet tags if provided
    if (diet_tag_ids) {
      const dietTags = await this.dietTagRepository.findBy({
        id: In(diet_tag_ids),
      });
      dish.diet_tags = dietTags;
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
    return this.findOne(id, userId);
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

  async getCategories(query?: string, limit: number = 50, offset: number = 0) {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder("category")
      .where("category.is_active = :isActive", { isActive: true })
      .orderBy("category.sort_order", "ASC")
      .take(limit)
      .skip(offset);

    // Add search query if provided
    if (query) {
      queryBuilder.andWhere(
        "(category.name ILIKE :query OR category.description ILIKE :query)",
        { query: `%${query}%` },
      );
    }

    const [categories, total] = await queryBuilder.getManyAndCount();

    return {
      categories,
      total,
      limit,
      offset,
    };
  }

  async createCategory(
    createDto: CreateDishCategoryDto,
    icon?: Express.Multer.File,
  ) {
    const category = this.categoryRepository.create({
      ...createDto,
      icon_url: icon ? `/uploads/categories/${icon.filename}` : null,
    });
    return this.categoryRepository.save(category);
  }

  async updateCategory(
    id: string,
    updateDto: UpdateDishCategoryDto,
    icon?: Express.Multer.File,
  ) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    // Only update fields that have non-empty values
    Object.keys(updateDto).forEach((key) => {
      const value = updateDto[key];
      // Only update if value is not empty string, null, or undefined
      if (value !== "" && value !== null && value !== undefined) {
        category[key] = value;
      }
    });

    // Update icon if new one is provided
    if (icon) {
      category.icon_url = `/uploads/categories/${icon.filename}`;
    }

    return this.categoryRepository.save(category);
  }

  async searchDishes(
    query: string,
    limit: number = 20,
    offset: number = 0,
    dishType?: string,
    categoryIds?: string[],
    userId?: string,
  ) {
    const queryBuilder = this.dishRepository
      .createQueryBuilder("dish")
      .where("dish.is_active = :isActive", { isActive: true })
      .andWhere("dish.is_public = :isPublic", { isPublic: true })
      .andWhere("(dish.name ILIKE :query OR dish.description ILIKE :query)", {
        query: `%${query}%`,
      })
      .leftJoinAndSelect("dish.categories", "categories")
      .leftJoinAndSelect("dish.diet_tags", "diet_tags")
      .take(limit)
      .skip(offset);

    // Add dish_type filter if provided
    if (dishType) {
      queryBuilder.andWhere(
        "dish.dish_type IS NOT NULL AND :dishType = ANY(dish.dish_type)",
        { dishType },
      );
    }

    // Add category filter if provided
    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere("categories.id IN (:...categoryIds)", {
        categoryIds,
      });
    }

    const [dishes, total] = await queryBuilder.getManyAndCount();

    // Add is_saved field if user is authenticated
    const dishesWithSavedStatus = userId
      ? await this.addIsSavedField(dishes, userId)
      : dishes;

    return {
      dishes: dishesWithSavedStatus,
      total,
      limit,
      offset,
    };
  }

  async findMyDishes(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    query?: string,
    dishType?: string,
    categoryIds?: string[],
  ) {
    const queryBuilder = this.dishRepository
      .createQueryBuilder("dish")
      .where("dish.created_by = :userId", { userId })
      .andWhere("dish.is_active = :isActive", { isActive: true })
      .leftJoinAndSelect("dish.categories", "categories")
      .leftJoinAndSelect("dish.diet_tags", "diet_tags")
      .orderBy("dish.created_at", "DESC")
      .take(limit)
      .skip(offset);

    // Add search query if provided
    if (query) {
      queryBuilder.andWhere(
        "(dish.name ILIKE :query OR dish.description ILIKE :query)",
        {
          query: `%${query}%`,
        },
      );
    }

    // Add dish_type filter if provided
    if (dishType) {
      queryBuilder.andWhere(
        "dish.dish_type IS NOT NULL AND :dishType = ANY(dish.dish_type)",
        { dishType },
      );
    }

    // Add category filter if provided
    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere("categories.id IN (:...categoryIds)", {
        categoryIds,
      });
    }

    const [dishes, total] = await queryBuilder.getManyAndCount();

    // Add is_saved field
    const dishesWithSavedStatus = await this.addIsSavedField(dishes, userId);

    return {
      dishes: dishesWithSavedStatus,
      total,
      limit,
      offset,
    };
  }

  async saveDish(userId: string, dishId: string) {
    // Check if dish exists
    const dish = await this.dishRepository.findOne({
      where: { id: dishId, is_active: true },
    });

    if (!dish) {
      throw new NotFoundException("Dish not found");
    }

    // Check if already saved
    const existingSave = await this.savedDishRepository.findOne({
      where: { user_id: userId, dish_id: dishId },
    });

    if (existingSave) {
      return {
        message: "Dish already saved",
        saved: true,
      };
    }

    // Save the dish
    const savedDish = this.savedDishRepository.create({
      user_id: userId,
      dish_id: dishId,
    });

    await this.savedDishRepository.save(savedDish);

    return {
      message: "Dish saved successfully",
      saved: true,
    };
  }

  async unsaveDish(userId: string, dishId: string) {
    const savedDish = await this.savedDishRepository.findOne({
      where: { user_id: userId, dish_id: dishId },
    });

    if (!savedDish) {
      throw new NotFoundException("Saved dish not found");
    }

    await this.savedDishRepository.remove(savedDish);

    return {
      message: "Dish unsaved successfully",
      saved: false,
    };
  }

  async getSavedDishes(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    query?: string,
    dishType?: string,
    categoryIds?: string[],
  ) {
    const queryBuilder = this.savedDishRepository
      .createQueryBuilder("saved_dish")
      .leftJoinAndSelect("saved_dish.dish", "dish")
      .leftJoinAndSelect("dish.categories", "categories")
      .leftJoinAndSelect("dish.diet_tags", "diet_tags")
      .where("saved_dish.user_id = :userId", { userId })
      .andWhere("dish.is_active = :isActive", { isActive: true })
      .orderBy("saved_dish.saved_at", "DESC")
      .take(limit)
      .skip(offset);

    // Add search query if provided
    if (query) {
      queryBuilder.andWhere(
        "(dish.name ILIKE :query OR dish.description ILIKE :query)",
        {
          query: `%${query}%`,
        },
      );
    }

    // Add dish_type filter if provided
    if (dishType) {
      queryBuilder.andWhere(
        "dish.dish_type IS NOT NULL AND :dishType = ANY(dish.dish_type)",
        { dishType },
      );
    }

    // Add category filter if provided
    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere("categories.id IN (:...categoryIds)", {
        categoryIds,
      });
    }

    const [savedDishes, total] = await queryBuilder.getManyAndCount();

    // Extract the dishes from the saved dishes and add is_saved field
    const dishes = savedDishes.map((savedDish) => ({
      ...savedDish.dish,
      saved_at: savedDish.saved_at,
      is_saved: true, // All dishes in saved list are saved
    }));

    return {
      dishes,
      total,
      limit,
      offset,
    };
  }

  async isSaved(userId: string, dishId: string): Promise<boolean> {
    const savedDish = await this.savedDishRepository.findOne({
      where: { user_id: userId, dish_id: dishId },
    });

    return !!savedDish;
  }

  /**
   * Helper method to add is_saved field to dishes
   */
  private async addIsSavedField(dishes: Dish[], userId: string) {
    if (!dishes || dishes.length === 0) {
      return dishes;
    }

    const dishIds = dishes.map((dish) => dish.id);

    // Get all saved dishes for this user in one query
    const savedDishes = await this.savedDishRepository.find({
      where: {
        user_id: userId,
        dish_id: In(dishIds),
      },
    });

    // Create a Set of saved dish IDs for quick lookup
    const savedDishIds = new Set(savedDishes.map((sd) => sd.dish_id));

    // Add is_saved field to each dish
    return dishes.map((dish) => ({
      ...dish,
      is_saved: savedDishIds.has(dish.id),
    }));
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';
import { Dish } from './entities/dish.entity';
import { DishCategory } from './entities/dish-category.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { DishCookingStep } from './entities/dish-cooking-step.entity';
import { SavedDish } from './entities/saved-dish.entity';
import { DietTag } from '../diet-tags/entities/diet-tag.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dish,
      DishCategory,
      DishIngredient,
      DishCookingStep,
      SavedDish,
      DietTag,
      User,
    ]),
  ],
  controllers: [DishesController],
  providers: [DishesService],
  exports: [DishesService],
})
export class DishesModule {}

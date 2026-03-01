import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';
import { Dish } from './entities/dish.entity';
import { DishCategory } from './entities/dish-category.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { DishCookingStep } from './entities/dish-cooking-step.entity';
import { DietTag } from '../diet-tags/entities/diet-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dish,
      DishCategory,
      DishIngredient,
      DishCookingStep,
      DietTag,
    ]),
  ],
  controllers: [DishesController],
  providers: [DishesService],
  exports: [DishesService],
})
export class DishesModule {}

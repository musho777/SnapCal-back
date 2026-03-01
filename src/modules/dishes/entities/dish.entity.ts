import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DishCategory } from './dish-category.entity';
import { DishIngredient } from './dish-ingredient.entity';
import { DishCookingStep } from './dish-cooking-step.entity';
import { MealDish } from '../../meals/entities/meal-dish.entity';
import { DishRating } from '../../ratings/entities/dish-rating.entity';
import { DietTag } from '../../../common/enums/diet-tag.enum';
import { DishType } from '../../../common/enums/dish-type.enum';

@Entity('dishes')
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string | null;

  @Column({ type: 'int', nullable: true })
  prep_time_minutes: number | null;

  @Column({ type: 'int', nullable: true })
  cook_time_minutes: number | null;

  @Column({ type: 'int', default: 1 })
  servings: number;

  // Nutrition per serving
  @Column({ type: 'int' })
  calories: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  protein_g: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  carbs_g: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  fats_g: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  fiber_g: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  sugar_g: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  sodium_mg: number | null;

  @ApiProperty({ enum: DietTag, isArray: true, required: false })
  @Column({ type: 'simple-array', nullable: true })
  diet_tags: DietTag[] | null;

  @ApiProperty({ enum: DishType, isArray: true, required: false })
  @Column({ type: 'simple-array', nullable: true })
  dish_type: DishType[] | null;

  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid', nullable: true })
  created_by: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  average_rating: number;

  @Column({ type: 'int', default: 0 })
  rating_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToMany(() => DishCategory, (category) => category.dishes)
  @JoinTable({
    name: 'dish_category_mapping',
    joinColumn: { name: 'dish_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: DishCategory[];

  @OneToMany(() => DishIngredient, (ingredient) => ingredient.dish, {
    cascade: true,
  })
  ingredients: DishIngredient[];

  @OneToMany(() => DishCookingStep, (step) => step.dish, { cascade: true })
  cooking_steps: DishCookingStep[];

  @OneToMany(() => MealDish, (mealDish) => mealDish.dish)
  meal_dishes: MealDish[];

  @OneToMany(() => DishRating, (rating) => rating.dish)
  ratings: DishRating[];
}

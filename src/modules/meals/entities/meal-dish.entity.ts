import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Meal } from './meal.entity';
import { Dish } from '../../dishes/entities/dish.entity';

@Entity('meal_dishes')
@Index(['meal_id'])
export class MealDish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  meal_id: string;

  @Column({ type: 'uuid' })
  dish_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  servings: number;

  @Column({ type: 'int' })
  calories_at_time: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  protein_at_time_g: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  carbs_at_time_g: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  fats_at_time_g: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Meal, (meal) => meal.meal_dishes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;

  @ManyToOne(() => Dish, (dish) => dish.meal_dishes)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;
}

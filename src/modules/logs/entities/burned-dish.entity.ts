import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserDailyLog } from './user-daily-log.entity';
import { Dish } from '../../dishes/entities/dish.entity';
import { Meal } from '../../meals/entities/meal.entity';

@Entity('burned_dishes')
export class BurnedDish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  daily_log_id: string;

  @Column({ type: 'uuid' })
  dish_id: string;

  @Column({ type: 'uuid' })
  meal_id: string;

  @Column({ type: 'int' })
  calories_burned: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => UserDailyLog, (log) => log.burned_dishes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_log_id' })
  daily_log: UserDailyLog;

  @ManyToOne(() => Dish)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @ManyToOne(() => Meal)
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;
}

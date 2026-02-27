import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { MealType } from '@/common/enums';
import { UserDailyLog } from '../../logs/entities/user-daily-log.entity';
import { MealDish } from './meal-dish.entity';

@Entity('meals')
@Unique(['daily_log_id', 'meal_type'])
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  daily_log_id: string;

  @Column({
    type: 'enum',
    enum: MealType,
  })
  meal_type: MealType;

  @Column({ type: 'int', default: 0 })
  total_calories: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  total_protein_g: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  total_carbs_g: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  total_fats_g: number;

  @Column({ type: 'timestamp', nullable: true })
  consumed_at: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => UserDailyLog, (log) => log.meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_log_id' })
  daily_log: UserDailyLog;

  @OneToMany(() => MealDish, (mealDish) => mealDish.meal, { cascade: true })
  meal_dishes: MealDish[];
}

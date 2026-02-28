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
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Meal } from '../../meals/entities/meal.entity';

@Entity('user_daily_logs')
@Unique(['user_id', 'log_date'])
@Index(['user_id', 'log_date'])
export class UserDailyLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'date' })
  log_date: Date;

  @Column({ type: 'int', default: 0 })
  calories_consumed: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  protein_consumed_g: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  carbs_consumed_g: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  fats_consumed_g: number;

  @Column({ type: 'int', default: 0 })
  calories_burned: number;

  @Column({ type: 'int', nullable: true })
  target_calories: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  water_intake_liters: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.daily_logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Meal, (meal) => meal.daily_log, { cascade: true })
  meals: Meal[];
}

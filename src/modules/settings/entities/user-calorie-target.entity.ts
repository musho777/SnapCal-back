import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_calorie_targets')
@Unique(['user_id', 'target_date'])
@Index(['user_id', 'target_date'])
export class UserCalorieTarget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'date' })
  target_date: Date;

  @Column({ type: 'int' })
  target_calories: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  target_protein_g: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  target_carbs_g: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  target_fats_g: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.calorie_targets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Goal, ActivityLevel } from '@/common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @Column({
    type: 'enum',
    enum: Goal,
    default: Goal.MAINTAIN_WEIGHT,
  })
  goal: Goal;

  @Column({
    type: 'enum',
    enum: ActivityLevel,
    default: ActivityLevel.MODERATE,
  })
  activity_level: ActivityLevel;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  target_weight_kg: number | null;

  @Column({ type: 'boolean', default: true })
  notifications_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  dark_mode: boolean;

  @Column({ type: 'varchar', length: 10, default: 'metric' })
  measurement_system: string; // 'metric' or 'imperial'

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

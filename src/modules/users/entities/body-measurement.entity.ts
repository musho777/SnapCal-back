import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('body_measurements')
@Unique(['user_id', 'measured_at'])
export class BodyMeasurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_kg: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm: number | null;

  @Column({ type: 'timestamp' })
  measured_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.body_measurements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notification_types')
export class NotificationType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string; // e.g., 'meal_reminder', 'water', 'goal', 'tip'

  @Column({ type: 'varchar', length: 100 })
  label: string; // Display name, e.g., 'Meal Reminder'

  @Column({ type: 'varchar', length: 10 })
  icon: string; // Emoji

  @Column({ type: 'varchar', length: 20 })
  icon_bg: string; // Background color

  @Column({ type: 'varchar', length: 20 })
  icon_color: string; // Icon color

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_default: boolean; // True for the 4 default types

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

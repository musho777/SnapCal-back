import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationType } from './notification-type.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  notification_type_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 10 })
  icon: string;

  @Column({ type: 'varchar', length: 20 })
  icon_bg: string;

  @Column({ type: 'varchar', length: 20 })
  icon_color: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => NotificationType)
  @JoinColumn({ name: 'notification_type_id' })
  notification_type: NotificationType;
}

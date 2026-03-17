import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Dish } from './dish.entity';

@Entity('saved_dishes')
@Index(['user_id', 'dish_id'], { unique: true })
export class SavedDish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  dish_id: string;

  @CreateDateColumn()
  saved_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.saved_dishes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Dish, (dish) => dish.saved_by_users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;
}

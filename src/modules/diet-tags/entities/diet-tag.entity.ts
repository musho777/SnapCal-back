import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Dish } from '../../dishes/entities/dish.entity';
import { User } from '../../users/entities/user.entity';

@Entity('diet_tags')
export class DietTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToMany(() => Dish, (dish) => dish.diet_tags)
  dishes: Dish[];

  @ManyToMany(() => User, (user) => user.diet_preferences)
  users: User[];
}

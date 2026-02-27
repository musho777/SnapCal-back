import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Dish } from './dish.entity';

@Entity('dish_cooking_steps')
export class DishCookingStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  dish_id: string;

  @Column({ type: 'int' })
  step_number: number;

  @Column({ type: 'text' })
  instruction: string;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string | null;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Dish, (dish) => dish.cooking_steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;
}

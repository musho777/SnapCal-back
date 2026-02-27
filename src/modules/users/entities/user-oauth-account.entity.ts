import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { AuthProvider } from '@/common/enums';
import { User } from './user.entity';

@Entity('user_oauth_accounts')
@Unique(['provider', 'provider_user_id'])
export class UserOAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
  })
  provider: AuthProvider;

  @Column({ type: 'varchar', length: 255 })
  provider_user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  provider_email: string | null;

  @Column({ type: 'text', nullable: true })
  access_token: string | null;

  @Column({ type: 'text', nullable: true })
  refresh_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  token_expires_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.oauth_accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { AuthProvider } from '@/common/enums';
import { UserProfile } from './user-profile.entity';
import { UserOAuthAccount } from './user-oauth-account.entity';
import { UserSettings } from '../../settings/entities/user-settings.entity';
import { UserCalorieTarget } from '../../settings/entities/user-calorie-target.entity';
import { UserDailyLog } from '../../logs/entities/user-daily-log.entity';
import { BodyMeasurement } from '../../users/entities/body-measurement.entity';
import { DishRating } from '../../ratings/entities/dish-rating.entity';
import { DietTag } from '../../diet-tags/entities/diet-tag.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash: string | null;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.EMAIL,
  })
  auth_provider: AuthProvider;

  @Column({ type: 'boolean', default: false })
  is_guest: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date | null;

  // Guest session fields (nullable for registered users)
  @Index()
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  guest_token: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device_type: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_activity_at: Date | null;

  // Relations
  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  @OneToMany(() => UserOAuthAccount, (oauth) => oauth.user, { cascade: true })
  oauth_accounts: UserOAuthAccount[];

  @OneToOne(() => UserSettings, (settings) => settings.user, { cascade: true })
  settings: UserSettings;

  @OneToMany(() => UserCalorieTarget, (target) => target.user)
  calorie_targets: UserCalorieTarget[];

  @OneToMany(() => UserDailyLog, (log) => log.user)
  daily_logs: UserDailyLog[];

  @OneToMany(() => BodyMeasurement, (measurement) => measurement.user)
  body_measurements: BodyMeasurement[];

  @OneToMany(() => DishRating, (rating) => rating.user)
  ratings: DishRating[];

  @ManyToMany(() => DietTag, (dietTag) => dietTag.users)
  @JoinTable({
    name: 'user_diet_preferences',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'diet_tag_id', referencedColumnName: 'id' },
  })
  diet_preferences: DietTag[];
}

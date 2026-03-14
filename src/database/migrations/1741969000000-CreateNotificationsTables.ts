import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTables1741969000000
  implements MigrationInterface
{
  name = 'CreateNotificationsTables1741969000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create notification_types table first
    await queryRunner.query(`
      CREATE TABLE "notification_types" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) UNIQUE NOT NULL,
        "label" varchar(100) NOT NULL,
        "icon" varchar(10) NOT NULL,
        "icon_bg" varchar(20) NOT NULL,
        "icon_color" varchar(20) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Insert default notification types
    await queryRunner.query(`
      INSERT INTO "notification_types" ("name", "label", "icon", "icon_bg", "icon_color", "is_default")
      VALUES
        ('meal_reminder', 'Meal Reminder', '🍳', '#FFF8E7', '#F59E0B', true),
        ('water', 'Water Reminder', '💧', '#EFF6FF', '#3B82F6', true),
        ('goal', 'Goal Progress', '🎯', '#F0FDF4', '#10B981', true),
        ('tip', 'Health Tip', '💡', '#FEF3C7', '#FBBF24', true)
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "notification_type_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "message" text NOT NULL,
        "icon" varchar(10) NOT NULL,
        "icon_bg" varchar(20) NOT NULL,
        "icon_color" varchar(20) NOT NULL,
        "read" boolean NOT NULL DEFAULT false,
        "read_at" timestamp NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_notifications_type" FOREIGN KEY ("notification_type_id")
          REFERENCES "notification_types"("id") ON DELETE CASCADE
      )
    `);

    // Create notification_preferences table
    await queryRunner.query(`
      CREATE TABLE "notification_preferences" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "notification_type_id" uuid NOT NULL,
        "is_enabled" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_notification_preferences_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_notification_preferences_type" FOREIGN KEY ("notification_type_id")
          REFERENCES "notification_types"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_notification_preferences_user_type" UNIQUE ("user_id", "notification_type_id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_read" ON "notifications" ("user_id", "read")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notification_preferences_user_id" ON "notification_preferences" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_notification_preferences_user_id"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_notifications_user_read"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_notifications_created_at"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_notifications_user_id"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_types"`);
  }
}

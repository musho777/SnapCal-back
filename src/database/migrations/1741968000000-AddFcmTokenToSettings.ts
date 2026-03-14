import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFcmTokenToSettings1741968000000 implements MigrationInterface {
  name = 'AddFcmTokenToSettings1741968000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_settings"
      ADD COLUMN "fcm_token" varchar(500) NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "user_settings"
      ADD COLUMN "fcm_device_type" varchar(50) NULL
    `);

    // Add index for faster lookups by token (useful for token validation)
    await queryRunner.query(`
      CREATE INDEX "IDX_user_settings_fcm_token" ON "user_settings" ("fcm_token")
      WHERE "fcm_token" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_user_settings_fcm_token"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_settings"
      DROP COLUMN "fcm_device_type"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_settings"
      DROP COLUMN "fcm_token"
    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDietPreferencesTable1774119308000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old diet_preferences table
    // This table is replaced by the diet_tags table with user_diet_preferences junction table
    await queryRunner.query(`DROP TABLE IF EXISTS "diet_preferences";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the table if we need to rollback
    await queryRunner.query(`
      CREATE TABLE "diet_preferences" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "preference_type" varchar(100) NOT NULL,
        "preference_value" varchar(255) NOT NULL,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }
}

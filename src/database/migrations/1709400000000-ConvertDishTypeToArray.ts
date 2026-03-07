import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertDishTypeToArray1709400000000 implements MigrationInterface {
  name = 'ConvertDishTypeToArray1709400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert existing comma-separated values to PostgreSQL array
    await queryRunner.query(`
      ALTER TABLE "dishes"
      ALTER COLUMN "dish_type" TYPE text[] USING
        CASE
          WHEN "dish_type" IS NULL THEN NULL
          WHEN "dish_type" = '' THEN NULL
          ELSE string_to_array("dish_type", ',')
        END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Convert PostgreSQL array back to comma-separated string
    await queryRunner.query(`
      ALTER TABLE "dishes"
      ALTER COLUMN "dish_type" TYPE text USING
        CASE
          WHEN "dish_type" IS NULL THEN NULL
          ELSE array_to_string("dish_type", ',')
        END
    `);
  }
}

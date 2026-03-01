import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDishTypeToDishes1709290000000 implements MigrationInterface {
  name = 'AddDishTypeToDishes1709290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "dishes"
      ADD COLUMN "dish_type" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "dishes"
      DROP COLUMN "dish_type"
    `);
  }
}

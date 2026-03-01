import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDietTagsToDishes1709280000000 implements MigrationInterface {
  name = 'AddDietTagsToDishes1709280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "dishes"
      ADD COLUMN "diet_tags" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "dishes"
      DROP COLUMN "diet_tags"
    `);
  }
}

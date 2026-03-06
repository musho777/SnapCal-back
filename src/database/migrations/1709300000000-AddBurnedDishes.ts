import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddBurnedDishes1709300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'burned_dishes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'daily_log_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'dish_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'meal_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'calories_burned',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key for daily_log_id
    await queryRunner.createForeignKey(
      'burned_dishes',
      new TableForeignKey({
        columnNames: ['daily_log_id'],
        referencedTableName: 'user_daily_logs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for dish_id
    await queryRunner.createForeignKey(
      'burned_dishes',
      new TableForeignKey({
        columnNames: ['dish_id'],
        referencedTableName: 'dishes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for meal_id
    await queryRunner.createForeignKey(
      'burned_dishes',
      new TableForeignKey({
        columnNames: ['meal_id'],
        referencedTableName: 'meals',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add index for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_burned_dishes_daily_log_dish_meal" ON "burned_dishes" ("daily_log_id", "dish_id", "meal_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_burned_dishes_daily_log_dish_meal"`);
    await queryRunner.dropTable('burned_dishes');
  }
}

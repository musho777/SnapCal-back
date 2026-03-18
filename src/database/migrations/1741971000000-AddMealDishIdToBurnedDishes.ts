import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddMealDishIdToBurnedDishes1741971000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add meal_dish_id column
    await queryRunner.addColumn(
      'burned_dishes',
      new TableColumn({
        name: 'meal_dish_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add foreign key for meal_dish_id
    await queryRunner.createForeignKey(
      'burned_dishes',
      new TableForeignKey({
        columnNames: ['meal_dish_id'],
        referencedTableName: 'meal_dishes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Drop old index
    await queryRunner.query(`DROP INDEX "IDX_burned_dishes_daily_log_dish_meal"`);

    // Create new composite index including meal_dish_id
    await queryRunner.query(
      `CREATE INDEX "IDX_burned_dishes_daily_log_meal_dish" ON "burned_dishes" ("daily_log_id", "meal_dish_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop new index
    await queryRunner.query(`DROP INDEX "IDX_burned_dishes_daily_log_meal_dish"`);

    // Recreate old index
    await queryRunner.query(
      `CREATE INDEX "IDX_burned_dishes_daily_log_dish_meal" ON "burned_dishes" ("daily_log_id", "dish_id", "meal_id")`,
    );

    // Drop foreign key for meal_dish_id
    const table = await queryRunner.getTable('burned_dishes');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('meal_dish_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('burned_dishes', foreignKey);
      }
    }

    // Drop meal_dish_id column
    await queryRunner.dropColumn('burned_dishes', 'meal_dish_id');
  }
}

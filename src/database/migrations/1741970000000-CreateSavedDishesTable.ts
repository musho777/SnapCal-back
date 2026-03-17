import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateSavedDishesTable1741970000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create saved_dishes table
    await queryRunner.createTable(
      new Table({
        name: 'saved_dishes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'dish_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'saved_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create unique index on user_id and dish_id combination
    await queryRunner.createIndex(
      'saved_dishes',
      new TableIndex({
        name: 'IDX_saved_dishes_user_dish',
        columnNames: ['user_id', 'dish_id'],
        isUnique: true,
      }),
    );

    // Add foreign key for user_id
    await queryRunner.createForeignKey(
      'saved_dishes',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for dish_id
    await queryRunner.createForeignKey(
      'saved_dishes',
      new TableForeignKey({
        columnNames: ['dish_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dishes',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the table (foreign keys will be dropped automatically)
    await queryRunner.dropTable('saved_dishes');
  }
}

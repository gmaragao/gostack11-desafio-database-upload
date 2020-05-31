import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export default class addColumnType1590947450557 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropColumn('transactions', 'type');
  }
}

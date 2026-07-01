import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoundToFixtures1782260000000 implements MigrationInterface {
  name = "AddRoundToFixtures1782260000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`FIXTURES\` ADD \`round\` varchar(150) NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`FIXTURES\` DROP COLUMN \`round\``
    );
  }
}

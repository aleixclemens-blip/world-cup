import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToUserTable1782270000000 implements MigrationInterface {
  name = "AddRoleToUserTable1782270000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `USERS` ADD `role` enum('user', 'admin') NOT NULL DEFAULT 'user'"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `USERS` DROP COLUMN `role`");
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsernameToUserTable1782290000000 implements MigrationInterface {
  name = "AddUsernameToUserTable1782290000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `USERS` ADD `username` varchar(150) NOT NULL",
    );
    await queryRunner.query(
      "CREATE UNIQUE INDEX `IDX_users_username` ON `USERS` (`username`)",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DROP INDEX `IDX_users_username` ON `USERS`",
    );
    await queryRunner.query(
      "ALTER TABLE `USERS` DROP COLUMN `username`",
    );
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeamAchievements1782236378005 implements MigrationInterface {
  name = "AddTeamAchievements1782236378005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `TEAMS` ADD `world_cups_won` int NOT NULL DEFAULT '0'",
    );
    await queryRunner.query(
      "ALTER TABLE `TEAMS` ADD `continent_cups_won` int NOT NULL DEFAULT '0'",
    );
    await queryRunner.query(
      "ALTER TABLE `TEAMS` ADD `continent_cup_name` varchar(150) NOT NULL DEFAULT ''",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `TEAMS` DROP COLUMN `continent_cup_name`",
    );
    await queryRunner.query(
      "ALTER TABLE `TEAMS` DROP COLUMN `continent_cups_won`",
    );
    await queryRunner.query("ALTER TABLE `TEAMS` DROP COLUMN `world_cups_won`");
  }
}

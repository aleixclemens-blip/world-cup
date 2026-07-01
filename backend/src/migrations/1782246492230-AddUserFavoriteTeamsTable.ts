import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserFavoriteTeamsTable1782246492230 implements MigrationInterface {
  name = "AddUserFavoriteTeamsTable1782246492230";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`USER_FAVORITE_TEAMS\` (\`user_id\` int NOT NULL, \`team_id\` int NOT NULL, PRIMARY KEY (\`user_id\`, \`team_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`USER_FAVORITE_TEAMS\` ADD CONSTRAINT \`FK_USER_FAVORITES\` FOREIGN KEY (\`user_id\`) REFERENCES \`USERS\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`USER_FAVORITE_TEAMS\` ADD CONSTRAINT \`FK_TEAM_FAVORITES\` FOREIGN KEY (\`team_id\`) REFERENCES \`TEAMS\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`USER_FAVORITE_TEAMS\` DROP FOREIGN KEY \`FK_TEAM_FAVORITES\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`USER_FAVORITE_TEAMS\` DROP FOREIGN KEY \`FK_USER_FAVORITES\``,
    );
    await queryRunner.query(`DROP TABLE \`USER_FAVORITE_TEAMS\``);
  }
}
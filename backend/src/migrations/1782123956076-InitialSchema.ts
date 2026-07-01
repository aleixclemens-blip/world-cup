import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782123956076 implements MigrationInterface {
  name = "InitialSchema1782123956076";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`TEAMS\` (\`id\` int NOT NULL, \`name\` varchar(150) NOT NULL, \`founded\` int NOT NULL, \`main_stadium\` varchar(255) NOT NULL, \`main_stadium_city\` varchar(255) NOT NULL, \`group_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`GROUPS\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`STANDINGS\` (\`group\` varchar(50) NOT NULL, \`team_id\` int NOT NULL, \`team_name\` varchar(150) NOT NULL, \`games_won\` int NOT NULL DEFAULT '0', \`games_draw\` int NOT NULL DEFAULT '0', \`games_lost\` int NOT NULL DEFAULT '0', \`goals_for\` int NOT NULL DEFAULT '0', \`goals_against\` int NOT NULL DEFAULT '0', \`points\` int NOT NULL DEFAULT '0', INDEX \`IDX_a9d086528f98b9ee3fa09f16a1\` (\`group\`), PRIMARY KEY (\`group\`, \`team_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`FIXTURES\` (\`id\` int NOT NULL, \`referee\` varchar(150) NOT NULL, \`stadium\` varchar(255) NOT NULL, \`stadium_city\` varchar(255) NOT NULL, \`home_team_id\` int NOT NULL, \`home_team_name\` varchar(150) NOT NULL, \`away_team_id\` int NOT NULL, \`away_team_name\` varchar(150) NOT NULL, \`goals_home\` int NULL, \`goals_away\` int NULL, \`penalties_home\` int NULL, \`penalties_away\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`TEAMS\` ADD CONSTRAINT \`FK_424049e5fbde995318cd739426c\` FOREIGN KEY (\`group_id\`) REFERENCES \`GROUPS\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`STANDINGS\` ADD CONSTRAINT \`FK_46bdac6565549dc8f2e02847460\` FOREIGN KEY (\`team_id\`) REFERENCES \`TEAMS\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`FIXTURES\` ADD CONSTRAINT \`FK_665095a63873e69bf1259fa1fb1\` FOREIGN KEY (\`home_team_id\`) REFERENCES \`TEAMS\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`FIXTURES\` ADD CONSTRAINT \`FK_e0d59ba195a9d32c181467dc123\` FOREIGN KEY (\`away_team_id\`) REFERENCES \`TEAMS\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`FIXTURES\` DROP FOREIGN KEY \`FK_e0d59ba195a9d32c181467dc123\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`FIXTURES\` DROP FOREIGN KEY \`FK_665095a63873e69bf1259fa1fb1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`STANDINGS\` DROP FOREIGN KEY \`FK_46bdac6565549dc8f2e02847460\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`TEAMS\` DROP FOREIGN KEY \`FK_424049e5fbde995318cd739426c\``,
    );
    await queryRunner.query(`DROP TABLE \`FIXTURES\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_a9d086528f98b9ee3fa09f16a1\` ON \`STANDINGS\``,
    );
    await queryRunner.query(`DROP TABLE \`STANDINGS\``);
    await queryRunner.query(`DROP TABLE \`GROUPS\``);
    await queryRunner.query(`DROP TABLE \`TEAMS\``);
  }
}

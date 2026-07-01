import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventsTable1782250000000 implements MigrationInterface {
  name = "AddEventsTable1782250000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`EVENTS\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`fixture_id\` int NOT NULL,
        \`type\` varchar(50) NOT NULL,
        \`minute\` int NOT NULL,
        \`extra_minute\` int NULL,
        \`player_name\` varchar(150) NOT NULL,
        \`team_id\` int NOT NULL,
        \`team_name\` varchar(150) NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`
    );

    await queryRunner.query(
      `ALTER TABLE \`EVENTS\` ADD CONSTRAINT \`FK_events_fixture\` FOREIGN KEY (\`fixture_id\`) REFERENCES \`FIXTURES\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE \`EVENTS\` ADD CONSTRAINT \`FK_events_team\` FOREIGN KEY (\`team_id\`) REFERENCES \`TEAMS\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`EVENTS\` DROP FOREIGN KEY \`FK_events_team\``);
    await queryRunner.query(`ALTER TABLE \`EVENTS\` DROP FOREIGN KEY \`FK_events_fixture\``);
    await queryRunner.query(`DROP TABLE \`EVENTS\``);
  }
}

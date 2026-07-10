import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommentsTable1782280000000 implements MigrationInterface {
  name = "AddCommentsTable1782280000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`COMMENTS\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`content\` varchar(1000) NOT NULL,
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`user_id\` int NOT NULL,
        \`fixture_id\` int NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`
    );

    await queryRunner.query(
      `ALTER TABLE \`COMMENTS\` ADD CONSTRAINT \`FK_comments_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`USERS\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE \`COMMENTS\` ADD CONSTRAINT \`FK_comments_fixture\` FOREIGN KEY (\`fixture_id\`) REFERENCES \`FIXTURES\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`COMMENTS\` DROP FOREIGN KEY \`FK_comments_fixture\``);
    await queryRunner.query(`ALTER TABLE \`COMMENTS\` DROP FOREIGN KEY \`FK_comments_user\``);
    await queryRunner.query(`DROP TABLE \`COMMENTS\``);
  }
}

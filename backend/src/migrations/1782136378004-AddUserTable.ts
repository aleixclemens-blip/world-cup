import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTable1782136378004 implements MigrationInterface {
  name = "AddUserTable1782136378004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`USERS\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(150) NOT NULL, \`password\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a1689164dbbcca860ce6d17b2e\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a1689164dbbcca860ce6d17b2e\` ON \`USERS\``,
    );
    await queryRunner.query(`DROP TABLE \`USERS\``);
  }
}

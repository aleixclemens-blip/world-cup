import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokenTable1782226492229 implements MigrationInterface {
  name = "AddRefreshTokenTable1782226492229";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`REFRESH_TOKENS\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, \`expires_at\` timestamp NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_4856449925e1c78455f9dc2e25\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`REFRESH_TOKENS\` ADD CONSTRAINT \`FK_b55c8844a6d06129ab550dfe103\` FOREIGN KEY (\`user_id\`) REFERENCES \`USERS\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`REFRESH_TOKENS\` DROP FOREIGN KEY \`FK_b55c8844a6d06129ab550dfe103\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4856449925e1c78455f9dc2e25\` ON \`REFRESH_TOKENS\``,
    );
    await queryRunner.query(`DROP TABLE \`REFRESH_TOKENS\``);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddkeyclockUsers1792057732713 implements MigrationInterface {
  public async up(q: QueryRunner) {
    await q.query(`ALTER TABLE "users" ADD COLUMN "keycloak_id" uuid`);
    await q.query(
      `CREATE UNIQUE INDEX "uq_users_keycloak_id" ON "users" ("keycloak_id")`,
    );
  }

  public async down(q: QueryRunner) {
    await q.query(`DROP INDEX "uq_users_keycloak_id"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN "keycloak_id"`);
  }
}

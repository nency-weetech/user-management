import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillDefaultProfiles1789471410698 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "profiles" ("user_id", "name", "is_default")
      SELECT "id", 'Default', true
      FROM "users" u
      WHERE NOT EXISTS (
        SELECT 1 FROM "profiles" p WHERE p."user_id" = u."id"
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

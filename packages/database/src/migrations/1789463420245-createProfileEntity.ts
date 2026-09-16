import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfileEntity1789463420245 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "profiles" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "user_id" uuid NOT NULL, 
            "name" character varying NOT NULL, 
            "description" character varying, 
            "is_default" boolean NOT NULL DEFAULT false, 
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_profiles_one_default_per_user"
      ON "profiles" ("user_id")
      WHERE "is_default" = true
    `);
    await queryRunner.query(`CREATE INDEX "IDX_profiles_user_id" ON "profiles" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_profiles_user_id"`);
    await queryRunner.query(`
        DROP INDEX "IDX_profiles_one_default_per_user"
        `);
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`,
    );
    await queryRunner.query(`
      DROP TABLE "profiles"
    `);
  }
}

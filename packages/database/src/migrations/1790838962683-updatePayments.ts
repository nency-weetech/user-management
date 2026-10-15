import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePaymentPlanToPlanId1760000000000
  implements MigrationInterface
{
  name = 'ChangePaymentPlanToPlanId1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD COLUMN "new_plan_id" uuid
    `);
    await queryRunner.query(`
      UPDATE "payments" p
      SET "new_plan_id" = pc."id"
      FROM "plans_catalog" pc
      WHERE pc."target_type"::text = 'user'
        AND pc."name"::text = p."plan"::text
    `);
    const unmapped = await queryRunner.query(`
      SELECT "id", "plan"
      FROM "payments"
      WHERE "new_plan_id" IS NULL
    `);

    if (unmapped.length > 0) {
      throw new Error(
        `Could not map existing payment plans: ${JSON.stringify(unmapped)}`,
      );
    }
    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP COLUMN "plan"
    `);
    await queryRunner.query(`
      ALTER TABLE "payments"
      RENAME COLUMN "new_plan_id" TO "plan_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "payments"
      ALTER COLUMN "plan_id" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD CONSTRAINT "FK_payments_plan_id"
      FOREIGN KEY ("plan_id")
      REFERENCES "plans_catalog"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD COLUMN "plan" payments_plan_enum
    `);
    await queryRunner.query(`
      UPDATE "payments" p
      SET "plan" = pc."name"::text::payments_plan_enum
      FROM "plans_catalog" pc
      WHERE pc."id" = p."plan_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP CONSTRAINT "FK_payments_plan_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP COLUMN "plan_id"
    `);
  }
}
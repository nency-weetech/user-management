"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserOrOrganizationPlan1790833226628 = void 0;
class UpdateUserOrOrganizationPlan1790833226628 {
    name = 'UpdateUserOrOrganizationPlan1790833226628';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "user_plans"
      ADD COLUMN "new_plan_id" uuid
    `);
        await queryRunner.query(`
    UPDATE "user_plans" up
    SET "new_plan_id" = pc."id"
    FROM "plans_catalog" pc
    WHERE pc."target_type"::text = 'user'
        AND pc."name"::text = up."plan"::text
    `);
        const userPlanResult = await queryRunner.query(`
      SELECT COUNT(*)::int AS count
      FROM "user_plans"
      WHERE "new_plan_id" IS NULL
    `);
        if (userPlanResult[0].count > 0) {
            throw new Error('Could not map all user_plans.plan values to plans_catalog');
        }
        await queryRunner.query(`
      ALTER TABLE "user_plans"
      DROP COLUMN "plan"
    `);
        await queryRunner.query(`
      ALTER TABLE "user_plans"
      RENAME COLUMN "new_plan_id" TO "plan_id"
    `);
        await queryRunner.query(`
      ALTER TABLE "user_plans"
      ALTER COLUMN "plan_id" SET NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "user_plans"
      ADD CONSTRAINT "FK_user_plans_plan"
      FOREIGN KEY ("plan_id")
      REFERENCES "plans_catalog"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "organization_plans"
      ADD COLUMN "new_plan_id" uuid
    `);
        await queryRunner.query(`
    UPDATE "organization_plans" op
    SET "new_plan_id" = pc."id"
    FROM "plans_catalog" pc
    WHERE pc."target_type"::text = 'organization'
        AND pc."name"::text = op."plan"::text
    `);
        const organizationPlanResult = await queryRunner.query(`
      SELECT COUNT(*)::int AS count
      FROM "organization_plans"
      WHERE "new_plan_id" IS NULL
    `);
        if (organizationPlanResult[0].count > 0) {
            throw new Error('Could not map all organization_plans.plan values to plans_catalog');
        }
        await queryRunner.query(`
      ALTER TABLE "organization_plans"
      DROP COLUMN "plan"
    `);
        await queryRunner.query(`
      ALTER TABLE "organization_plans"
      RENAME COLUMN "new_plan_id" TO "plan_id"
    `);
        await queryRunner.query(`
      ALTER TABLE "organization_plans"
      ALTER COLUMN "plan_id" SET NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "organization_plans"
      ADD CONSTRAINT "FK_organization_plans_plan"
      FOREIGN KEY ("plan_id")
      REFERENCES "plans_catalog"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "organization_plans"
      ADD COLUMN "plan" varchar
    `);
        await queryRunner.query(`
      UPDATE "organization_plans" op
      SET "plan" = pc."name"
      FROM "plans_catalog" pc
      WHERE pc."id" = op."plan_id"
    `);
        await queryRunner.query(`
      ALTER TABLE "organization_plans"
      DROP CONSTRAINT "FK_organization_plans_plan"
    `);
        await queryRunner.query(`
      ALTER TABLE "organization_plans"
      DROP COLUMN "plan_id"
    `);
        await queryRunner.query(`
      ALTER TABLE "user_plans"
      ADD COLUMN "plan" varchar
    `);
        await queryRunner.query(`
      UPDATE "user_plans" up
      SET "plan" = pc."name"
      FROM "plans_catalog" pc
      WHERE pc."id" = up."plan_id"
    `);
        await queryRunner.query(`
      ALTER TABLE "user_plans"
      DROP CONSTRAINT "FK_user_plans_plan"
    `);
        await queryRunner.query(`
      ALTER TABLE "user_plans"
      DROP COLUMN "plan_id"
    `);
    }
}
exports.UpdateUserOrOrganizationPlan1790833226628 = UpdateUserOrOrganizationPlan1790833226628;

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProAndMaxPlan1787124124406 implements MigrationInterface {
    name = 'AddProAndMaxPlan1787124124406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."UserPlan_plan_enum" RENAME TO "UserPlan_plan_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."UserPlan_plan_enum" AS ENUM('free', 'pro', 'max')`);
        await queryRunner.query(`ALTER TABLE "UserPlan" ALTER COLUMN "plan" DROP DEFAULT`);
        await queryRunner.query(`
            ALTER TABLE "UserPlan" 
            ALTER COLUMN "plan" TYPE "public"."UserPlan_plan_enum" 
            USING (
                CASE "plan"::text
                    WHEN 'paid' THEN 'pro'::"public"."UserPlan_plan_enum"
                    ELSE "plan"::text::"public"."UserPlan_plan_enum"
                END
            )
        `);

        await queryRunner.query(`ALTER TABLE "UserPlan" ALTER COLUMN "plan" SET DEFAULT 'free'`);
        await queryRunner.query(`DROP TYPE "public"."UserPlan_plan_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."UserPlan_plan_enum_old" AS ENUM('free', 'paid')`);
        await queryRunner.query(`ALTER TABLE "UserPlan" ALTER COLUMN "plan" DROP DEFAULT`);

        // Map 'pro' and 'max' back to 'paid' when reverting
        await queryRunner.query(`
            ALTER TABLE "UserPlan" 
            ALTER COLUMN "plan" TYPE "public"."UserPlan_plan_enum_old" 
            USING (
                CASE "plan"::text
                    WHEN 'pro' THEN 'paid'::"public"."UserPlan_plan_enum_old"
                    WHEN 'max' THEN 'paid'::"public"."UserPlan_plan_enum_old"
                    ELSE "plan"::text::"public"."UserPlan_plan_enum_old"
                END
            )
        `);

        await queryRunner.query(`ALTER TABLE "UserPlan" ALTER COLUMN "plan" SET DEFAULT 'free'`);
        await queryRunner.query(`DROP TYPE "public"."UserPlan_plan_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."UserPlan_plan_enum_old" RENAME TO "UserPlan_plan_enum"`);
    }
}
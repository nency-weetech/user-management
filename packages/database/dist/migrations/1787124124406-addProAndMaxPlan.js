"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProAndMaxPlan1787124124406 = void 0;
class AddProAndMaxPlan1787124124406 {
    name = 'AddProAndMaxPlan1787124124406';
    async up(queryRunner) {
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
    async down(queryRunner) {
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
exports.AddProAndMaxPlan1787124124406 = AddProAndMaxPlan1787124124406;

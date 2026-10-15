"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPlanInPayment1787202363473 = void 0;
class AddPlanInPayment1787202363473 {
    name = 'AddPlanInPayment1787202363473';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."Payments_plan_enum" AS ENUM('free', 'pro', 'max')`);
        await queryRunner.query(`ALTER TABLE "Payments" ADD "plan" "public"."Payments_plan_enum"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "Payments" DROP COLUMN "plan"`);
        await queryRunner.query(`DROP TYPE "public"."Payments_plan_enum"`);
    }
}
exports.AddPlanInPayment1787202363473 = AddPlanInPayment1787202363473;

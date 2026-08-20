import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlanInPayment1787202363473 implements MigrationInterface {
    name = 'AddPlanInPayment1787202363473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Payments_plan_enum" AS ENUM('free', 'pro', 'max')`);
        await queryRunner.query(`ALTER TABLE "Payments" ADD "plan" "public"."Payments_plan_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Payments" DROP COLUMN "plan"`);
        await queryRunner.query(`DROP TYPE "public"."Payments_plan_enum"`);
    }

}

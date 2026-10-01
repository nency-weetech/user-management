"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUser1790849984660 = void 0;
class UpdateUser1790849984660 {
    name = 'UpdateUser1790849984660';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "stripe_customer_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_5ffbe395603641c29e8ce9b4c97" UNIQUE ("stripe_customer_id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_5ffbe395603641c29e8ce9b4c97"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "stripe_customer_id"`);
    }
}
exports.UpdateUser1790849984660 = UpdateUser1790849984660;

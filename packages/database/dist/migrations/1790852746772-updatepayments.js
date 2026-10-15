"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Updatepayments1790852746772 = void 0;
class Updatepayments1790852746772 {
    name = 'Updatepayments1790852746772';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" ADD "stripe_invoice_id" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "invoice_status" character varying`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "invoice_status"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "stripe_invoice_id"`);
    }
}
exports.Updatepayments1790852746772 = Updatepayments1790852746772;

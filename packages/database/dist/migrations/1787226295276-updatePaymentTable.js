"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePaymentTable1787226295276 = void 0;
class UpdatePaymentTable1787226295276 {
    name = 'UpdatePaymentTable1787226295276';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "Payments" ALTER COLUMN "stripeCheckoutSessionId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Payments" DROP CONSTRAINT "UQ_c317e4333232b25bffcf331b8bb"`);
        await queryRunner.query(`ALTER TABLE "Payments" ALTER COLUMN "stripePaymentIntentId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Payments" ADD CONSTRAINT "UQ_65b7d9b9815db575149711bca3f" UNIQUE ("stripePaymentIntentId")`);
        await queryRunner.query(`ALTER TABLE "Payments" ALTER COLUMN "plan" SET NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "Payments" ALTER COLUMN "plan" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Payments" DROP CONSTRAINT "UQ_65b7d9b9815db575149711bca3f"`);
        await queryRunner.query(`ALTER TABLE "Payments" ALTER COLUMN "stripePaymentIntentId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Payments" ADD CONSTRAINT "UQ_c317e4333232b25bffcf331b8bb" UNIQUE ("stripeCheckoutSessionId")`);
        await queryRunner.query(`ALTER TABLE "Payments" ALTER COLUMN "stripeCheckoutSessionId" SET NOT NULL`);
    }
}
exports.UpdatePaymentTable1787226295276 = UpdatePaymentTable1787226295276;

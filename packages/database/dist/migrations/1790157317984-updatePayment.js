"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePayment1790157317984 = void 0;
class UpdatePayment1790157317984 {
    name = 'UpdatePayment1790157317984';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" ADD "organization_id" uuid`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_fc07ace491143726974991711f2" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_fc07ace491143726974991711f2"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "organization_id"`);
    }
}
exports.UpdatePayment1790157317984 = UpdatePayment1790157317984;

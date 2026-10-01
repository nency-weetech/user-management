"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Updateorg1790850861362 = void 0;
class Updateorg1790850861362 {
    name = 'Updateorg1790850861362';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "organizations" ADD "stripe_customer_id" character varying`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "UQ_5bde3aaf27941b46de9ed677173" UNIQUE ("stripe_customer_id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "UQ_5bde3aaf27941b46de9ed677173"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "stripe_customer_id"`);
    }
}
exports.Updateorg1790850861362 = Updateorg1790850861362;

import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatepayments1790852746772 implements MigrationInterface {
    name = 'Updatepayments1790852746772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "stripe_invoice_id" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "invoice_status" character varying`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "invoice_status"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "stripe_invoice_id"`);
    }
}

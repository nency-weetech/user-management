import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1790849984660 implements MigrationInterface {
    name = 'UpdateUser1790849984660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "stripe_customer_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_5ffbe395603641c29e8ce9b4c97" UNIQUE ("stripe_customer_id")`);     
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_5ffbe395603641c29e8ce9b4c97"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "stripe_customer_id"`);
    }

}

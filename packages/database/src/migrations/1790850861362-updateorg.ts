import { MigrationInterface, QueryRunner } from "typeorm";

export class Updateorg1790850861362 implements MigrationInterface {
    name = 'Updateorg1790850861362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" ADD "stripe_customer_id" character varying`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "UQ_5bde3aaf27941b46de9ed677173" UNIQUE ("stripe_customer_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "UQ_5bde3aaf27941b46de9ed677173"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "stripe_customer_id"`);
    }
}

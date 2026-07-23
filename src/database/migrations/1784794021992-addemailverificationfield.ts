import { MigrationInterface, QueryRunner } from "typeorm";

export class Addemailverificationfield1784794021992 implements MigrationInterface {
    name = 'Addemailverificationfield1784794021992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationOtp" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationOtp"`);
    }

}

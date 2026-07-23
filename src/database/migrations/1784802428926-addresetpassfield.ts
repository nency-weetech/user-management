import { MigrationInterface, QueryRunner } from "typeorm";

export class Addresetpassfield1784802428926 implements MigrationInterface {
    name = 'Addresetpassfield1784802428926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "passwordResetOtp" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetOtpExpires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "otpAttempts" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otpAttempts"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetOtpExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "passwordResetOtp"`);
    }

}

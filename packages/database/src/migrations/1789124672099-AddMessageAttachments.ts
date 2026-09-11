import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageAttachments1789124672099 implements MigrationInterface {
    name = 'AddMessageAttachments1789124672099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" ADD "file_key" character varying`);
        await queryRunner.query(`ALTER TABLE "message" ADD "file_name" character varying`);
        await queryRunner.query(`ALTER TABLE "message" ADD "file_type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "file_type"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "file_name"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "file_key"`);
    }

}

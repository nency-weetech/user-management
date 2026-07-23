import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefTokInUserEntity1784787597902 implements MigrationInterface {
    name = 'AddRefTokInUserEntity1784787597902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookmarkUsageColumns1789635330959 implements MigrationInterface {
    name = 'AddBookmarkUsageColumns1789635330959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_usages" ADD "daily_bookmark_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_usages" ADD "daily_bookmark_reset_at" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_usages" DROP COLUMN "daily_bookmark_reset_at"`);
        await queryRunner.query(`ALTER TABLE "user_usages" DROP COLUMN "daily_bookmark_count"`);
    }

}

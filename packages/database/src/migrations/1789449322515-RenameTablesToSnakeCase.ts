import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTablesToSnakeCase1789449322515 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "news-fetch-log" RENAME TO news_fetch_logs`);
        await queryRunner.query(`ALTER TABLE "Payments" RENAME TO payments`);
        await queryRunner.query(`ALTER TABLE "UserPlan" RENAME TO user_plans`);
        await queryRunner.query(`ALTER TABLE "UserUsage" RENAME TO user_usages`);
        await queryRunner.query(`ALTER TABLE "message" RENAME TO messages`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" RENAME TO message`);
        await queryRunner.query(`ALTER TABLE "user_usages" RENAME TO UserUsage`);
        await queryRunner.query(`ALTER TABLE "user_plans" RENAME TO UserPlan`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME TO Payments`);
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" RENAME TO news-fetch-log`);
    }
}

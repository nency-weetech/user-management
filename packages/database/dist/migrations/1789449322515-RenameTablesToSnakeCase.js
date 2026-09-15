"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameTablesToSnakeCase1789449322515 = void 0;
class RenameTablesToSnakeCase1789449322515 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "news-fetch-log" RENAME TO news_fetch_logs`);
        await queryRunner.query(`ALTER TABLE "Payments" RENAME TO payments`);
        await queryRunner.query(`ALTER TABLE "UserPlan" RENAME TO user_plans`);
        await queryRunner.query(`ALTER TABLE "UserUsage" RENAME TO user_usages`);
        await queryRunner.query(`ALTER TABLE "message" RENAME TO messages`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "messages" RENAME TO message`);
        await queryRunner.query(`ALTER TABLE "user_usages" RENAME TO UserUsage`);
        await queryRunner.query(`ALTER TABLE "user_plans" RENAME TO UserPlan`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME TO Payments`);
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" RENAME TO news-fetch-log`);
    }
}
exports.RenameTablesToSnakeCase1789449322515 = RenameTablesToSnakeCase1789449322515;

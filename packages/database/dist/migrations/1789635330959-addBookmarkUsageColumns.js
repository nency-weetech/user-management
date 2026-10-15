"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBookmarkUsageColumns1789635330959 = void 0;
class AddBookmarkUsageColumns1789635330959 {
    name = 'AddBookmarkUsageColumns1789635330959';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_usages" ADD "daily_bookmark_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_usages" ADD "daily_bookmark_reset_at" date`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_usages" DROP COLUMN "daily_bookmark_reset_at"`);
        await queryRunner.query(`ALTER TABLE "user_usages" DROP COLUMN "daily_bookmark_count"`);
    }
}
exports.AddBookmarkUsageColumns1789635330959 = AddBookmarkUsageColumns1789635330959;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateArticleTimestamps1785478938370 = void 0;
class UpdateArticleTimestamps1785478938370 {
    name = 'UpdateArticleTimestamps1785478938370';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "createdAt"`);
    }
}
exports.UpdateArticleTimestamps1785478938370 = UpdateArticleTimestamps1785478938370;

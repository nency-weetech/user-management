"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateArticles1785408883415 = void 0;
class UpdateArticles1785408883415 {
    name = 'UpdateArticles1785408883415';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "updatedAt"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }
}
exports.UpdateArticles1785408883415 = UpdateArticles1785408883415;

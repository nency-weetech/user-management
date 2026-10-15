"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateArticles1785408161054 = void 0;
class UpdateArticles1785408161054 {
    name = 'UpdateArticles1785408161054';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "publishDated"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "publishDated" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "lastRefreshedAt"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "lastRefreshedAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "lastRefreshedAt"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "lastRefreshedAt" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "publishDated"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "publishDated" TIMESTAMP NOT NULL`);
    }
}
exports.UpdateArticles1785408161054 = UpdateArticles1785408161054;

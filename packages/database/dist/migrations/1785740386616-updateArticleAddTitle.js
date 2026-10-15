"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateArticleAddTitle1785740386616 = void 0;
class UpdateArticleAddTitle1785740386616 {
    name = 'UpdateArticleAddTitle1785740386616';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" ADD "title" character varying`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "title"`);
    }
}
exports.UpdateArticleAddTitle1785740386616 = UpdateArticleAddTitle1785740386616;

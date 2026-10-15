"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBookmark1789964991737 = void 0;
class UpdateBookmark1789964991737 {
    name = 'UpdateBookmark1789964991737';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "bookmarks" ADD "organization_id" uuid`);
        await queryRunner.query(`ALTER TABLE "bookmarks" ADD CONSTRAINT "FK_4137fd8ae497e4ac62d049608a8" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "bookmarks" DROP CONSTRAINT "FK_4137fd8ae497e4ac62d049608a8"`);
        await queryRunner.query(`ALTER TABLE "bookmarks" DROP COLUMN "organization_id"`);
    }
}
exports.UpdateBookmark1789964991737 = UpdateBookmark1789964991737;

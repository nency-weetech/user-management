"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateColumnName1789548780458 = void 0;
class UpdateColumnName1789548780458 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE articles RENAME COLUMN "updatedAt" TO updated_at`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE articles RENAME COLUMN "updated_at" TO updatedAt`);
    }
}
exports.UpdateColumnName1789548780458 = UpdateColumnName1789548780458;

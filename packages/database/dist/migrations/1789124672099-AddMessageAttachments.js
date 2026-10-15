"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMessageAttachments1789124672099 = void 0;
class AddMessageAttachments1789124672099 {
    name = 'AddMessageAttachments1789124672099';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "message" ADD "file_key" character varying`);
        await queryRunner.query(`ALTER TABLE "message" ADD "file_name" character varying`);
        await queryRunner.query(`ALTER TABLE "message" ADD "file_type" character varying`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "file_type"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "file_name"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "file_key"`);
    }
}
exports.AddMessageAttachments1789124672099 = AddMessageAttachments1789124672099;

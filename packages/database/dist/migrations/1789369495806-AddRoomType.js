"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRoomType1789369495806 = void 0;
class AddRoomType1789369495806 {
    name = 'AddRoomType1789369495806';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."rooms_type_enum" AS ENUM('group', 'direct')`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD "type" "public"."rooms_type_enum" NOT NULL DEFAULT 'direct'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."rooms_type_enum"`);
    }
}
exports.AddRoomType1789369495806 = AddRoomType1789369495806;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackfillDefaultProfiles1789471410698 = void 0;
class BackfillDefaultProfiles1789471410698 {
    async up(queryRunner) {
        await queryRunner.query(`
      INSERT INTO "profiles" ("user_id", "name", "is_default")
      SELECT "id", 'Default', true
      FROM "users" u
      WHERE NOT EXISTS (
        SELECT 1 FROM "profiles" p WHERE p."user_id" = u."id"
      )
    `);
    }
    async down(queryRunner) { }
}
exports.BackfillDefaultProfiles1789471410698 = BackfillDefaultProfiles1789471410698;

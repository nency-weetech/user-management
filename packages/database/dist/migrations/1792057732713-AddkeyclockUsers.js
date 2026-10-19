"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddkeyclockUsers1792057732713 = void 0;
class AddkeyclockUsers1792057732713 {
    async up(q) {
        await q.query(`ALTER TABLE "users" ADD COLUMN "keycloak_id" uuid`);
        await q.query(`CREATE UNIQUE INDEX "uq_users_keycloak_id" ON "users" ("keycloak_id")`);
    }
    async down(q) {
        await q.query(`DROP INDEX "uq_users_keycloak_id"`);
        await q.query(`ALTER TABLE "users" DROP COLUMN "keycloak_id"`);
    }
}
exports.AddkeyclockUsers1792057732713 = AddkeyclockUsers1792057732713;

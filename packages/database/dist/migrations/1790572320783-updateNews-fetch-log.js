"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNewsFetchLog1790572320783 = void 0;
class UpdateNewsFetchLog1790572320783 {
    name = 'UpdateNewsFetchLog1790572320783';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" DROP CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7"`);
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" ADD CONSTRAINT "FK_1e998f2fe8297666eba2944eb44" FOREIGN KEY ("triggered_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" DROP CONSTRAINT "FK_1e998f2fe8297666eba2944eb44"`);
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" ADD CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7" FOREIGN KEY ("triggered_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
exports.UpdateNewsFetchLog1790572320783 = UpdateNewsFetchLog1790572320783;

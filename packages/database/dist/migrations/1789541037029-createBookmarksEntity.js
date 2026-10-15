"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookmarksEntity1789541037029 = void 0;
class CreateBookmarksEntity1789541037029 {
    name = 'CreateBookmarksEntity1789541037029';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "bookmarks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_id" uuid NOT NULL, "article_id" uuid NOT NULL, "note" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6f2ef7f756502da6654dd9c2622" UNIQUE ("profile_id", "article_id"), CONSTRAINT "PK_7f976ef6cecd37a53bd11685f32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bookmarks" ADD CONSTRAINT "FK_42e305026468ab0da6e706f27bd" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookmarks" ADD CONSTRAINT "FK_7d82c6ffea39d2fc3e095149225" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "bookmarks" DROP CONSTRAINT "FK_7d82c6ffea39d2fc3e095149225"`);
        await queryRunner.query(`ALTER TABLE "bookmarks" DROP CONSTRAINT "FK_42e305026468ab0da6e706f27bd"`);
        await queryRunner.query(`DROP TABLE "bookmarks"`);
    }
}
exports.CreateBookmarksEntity1789541037029 = CreateBookmarksEntity1789541037029;

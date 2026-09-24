"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOrganizationUsage1790141758251 = void 0;
class AddOrganizationUsage1790141758251 {
    name = 'AddOrganizationUsage1790141758251';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "organization_usages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "daily_bookmark_count" integer NOT NULL DEFAULT '0', "daily_bookmark_reset_at" date, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_32c122a0356aa64ec5c4c297ffb" UNIQUE ("organization_id"), CONSTRAINT "PK_276d3c5cc880bade21c476848ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_usages" DROP CONSTRAINT "UQ_a1533fed67f9f86b226628c92ae"`);
        await queryRunner.query(`ALTER TABLE "user_usages" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "user_usages" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "user_usages" ADD CONSTRAINT "UQ_88aa65ff51f7d05e33cb0ba227f" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "organization_usages" ADD CONSTRAINT "FK_32c122a0356aa64ec5c4c297ffb" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_usages" ADD CONSTRAINT "FK_88aa65ff51f7d05e33cb0ba227f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_usages" DROP CONSTRAINT "FK_88aa65ff51f7d05e33cb0ba227f"`);
        await queryRunner.query(`ALTER TABLE "organization_usages" DROP CONSTRAINT "FK_32c122a0356aa64ec5c4c297ffb"`);
        await queryRunner.query(`ALTER TABLE "user_usages" DROP CONSTRAINT "UQ_88aa65ff51f7d05e33cb0ba227f"`);
        await queryRunner.query(`ALTER TABLE "user_usages" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "user_usages" ADD "user_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user_usages" ADD CONSTRAINT "UQ_a1533fed67f9f86b226628c92ae" UNIQUE ("user_id")`);
        await queryRunner.query(`DROP TABLE "organization_usages"`);
    }
}
exports.AddOrganizationUsage1790141758251 = AddOrganizationUsage1790141758251;

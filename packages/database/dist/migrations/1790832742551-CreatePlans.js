"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlans1790832742551 = void 0;
class CreatePlans1790832742551 {
    name = 'CreatePlans1790832742551';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."plans_catalog_target_type_enum" AS ENUM('user', 'organization')`);
        await queryRunner.query(`CREATE TYPE "public"."plans_catalog_name_enum" AS ENUM('free', 'pro', 'max')`);
        await queryRunner.query(`CREATE TABLE "plans_catalog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "target_type" "public"."plans_catalog_target_type_enum" NOT NULL, "name" "public"."plans_catalog_name_enum" NOT NULL, "price" integer NOT NULL, "currency" character varying(3) NOT NULL, "daily_view_limit" integer, "daily_fetch_limit" integer, "profile_limit" integer, "bookmark_limit" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fdc56e96cc18b6d4f1aeb559d51" PRIMARY KEY ("id"))`);
        await queryRunner.query(`drop table "plans"`);
        await queryRunner.manager.insert('plans_catalog', [
            {
                target_type: 'user',
                name: 'free',
                price: 0,
                currency: 'INR',
                daily_view_limit: 20,
                daily_fetch_limit: 30,
                profile_limit: 3,
                bookmark_limit: 10,
            },
            {
                target_type: 'user',
                name: 'pro',
                price: 99,
                currency: 'INR',
                daily_view_limit: 100,
                daily_fetch_limit: 60,
                profile_limit: 10,
                bookmark_limit: 50,
            },
            {
                target_type: 'user',
                name: 'max',
                price: 299,
                currency: 'INR',
                daily_view_limit: null,
                daily_fetch_limit: null,
                profile_limit: null,
                bookmark_limit: null,
            },
            {
                target_type: 'organization',
                name: 'free',
                price: 0,
                currency: 'INR',
                daily_view_limit: null,
                daily_fetch_limit: null,
                profile_limit: null,
                bookmark_limit: 50,
            },
            {
                target_type: 'organization',
                name: 'pro',
                price: 499,
                currency: 'INR',
                daily_view_limit: null,
                daily_fetch_limit: null,
                profile_limit: null,
                bookmark_limit: 100,
            },
            {
                target_type: 'organization',
                name: 'max',
                price: 999,
                currency: 'INR',
                daily_view_limit: null,
                daily_fetch_limit: null,
                profile_limit: null,
                bookmark_limit: null,
            },
        ]);
    }
    async down(queryRunner) {
        await queryRunner.manager.delete('plans_catalog', {});
        await queryRunner.query(`CREATE TABLE "plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "target_type" "public"."plans_target_type_enum" NOT NULL, "name" "public"."plans_name_enum" NOT NULL, "price" integer NOT NULL, "currency" character varying(3) NOT NULL, "daily_view_limit" integer, "daily_fetch_limit" integer, "profile_limit" integer, "bookmark_limit" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fdc56e96cc18b6d4f1aeb559d51" PRIMARY KEY ("id"))`);
        await queryRunner.query(`DROP TABLE "plans_catalog"`);
        await queryRunner.query(`DROP TYPE "public"."plans_catalog_name_enum"`);
        await queryRunner.query(`DROP TYPE "public"."plans_catalog_target_type_enum"`);
    }
}
exports.CreatePlans1790832742551 = CreatePlans1790832742551;

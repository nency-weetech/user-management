"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNewsFetchLog1785478533477 = void 0;
class AddNewsFetchLog1785478533477 {
    name = 'AddNewsFetchLog1785478533477';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."news-fetch-log_triggeredby_enum" AS ENUM('corn', 'admin')`);
        await queryRunner.query(`CREATE TABLE "news-fetch-log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "query" character varying NOT NULL, "articlesFetched" integer NOT NULL DEFAULT '0', "triggeredBy" "public"."news-fetch-log_triggeredby_enum" NOT NULL, "triggeredByUserId" uuid, "success" boolean NOT NULL DEFAULT true, "errorMessage" text, "durationMs" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3d85ec33bbbf9bb5dbf977f96cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "news-fetch-log" ADD CONSTRAINT "FK_3c8edf08014b6c65febc564d5fa" FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "news-fetch-log" DROP CONSTRAINT "FK_3c8edf08014b6c65febc564d5fa"`);
        await queryRunner.query(`DROP TABLE "news-fetch-log"`);
        await queryRunner.query(`DROP TYPE "public"."news-fetch-log_triggeredby_enum"`);
    }
}
exports.AddNewsFetchLog1785478533477 = AddNewsFetchLog1785478533477;

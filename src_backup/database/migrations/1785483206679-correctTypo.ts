import { MigrationInterface, QueryRunner } from "typeorm";

export class CorrectTypo1785483206679 implements MigrationInterface {
    name = 'CorrectTypo1785483206679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."news-fetch-log_triggeredby_enum" AS ENUM('corn', 'admin')`);
        await queryRunner.query(`CREATE TABLE "news-fetch-log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "query" character varying NOT NULL, "articlesFetched" integer NOT NULL DEFAULT '0', "triggeredBy" "public"."news-fetch-log_triggeredby_enum" NOT NULL, "triggeredByUserId" uuid, "success" boolean NOT NULL DEFAULT true, "errorMessage" text, "durationMs" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_64661bf2aa43de2f9216b71f8d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "news-fetch-log" ADD CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7" FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "news-fetch-log" DROP CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7"`);
        await queryRunner.query(`DROP TABLE "news-fetch-log"`);
        await queryRunner.query(`DROP TYPE "public"."news-fetch-log_triggeredby_enum"`);
    }

}

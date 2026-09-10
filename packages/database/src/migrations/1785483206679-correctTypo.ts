import { MigrationInterface, QueryRunner } from "typeorm";

export class CorrectTypo1785483206679 implements MigrationInterface {
    name = 'CorrectTypo1785483206679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const typeExists = await queryRunner.query(
            `SELECT 1 FROM pg_type WHERE typname = 'news-fetch-log_triggeredby_enum'`
        );
        if (typeExists.length === 0) {
            await queryRunner.query(`CREATE TYPE "public"."news-fetch-log_triggeredby_enum" AS ENUM('corn', 'admin')`);
        }

        const tableExists = await queryRunner.hasTable('news-fetch-log');
        if (!tableExists) {
            await queryRunner.query(`CREATE TABLE "news-fetch-log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "query" character varying NOT NULL, "articlesFetched" integer NOT NULL DEFAULT '0', "triggeredBy" "public"."news-fetch-log_triggeredby_enum" NOT NULL, "triggeredByUserId" uuid, "success" boolean NOT NULL DEFAULT true, "errorMessage" text, "durationMs" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_64661bf2aa43de2f9216b71f8d9" PRIMARY KEY ("id"))`);
        }

        const constraintExists = await queryRunner.query(
            `SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_51fe272002e1ff7f853a29ec3b7'`
        );
        if (constraintExists.length === 0 && tableExists === false) {
            // only add if this migration was the one that created the table just now
            await queryRunner.query(`ALTER TABLE "news-fetch-log" ADD CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7" FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No-op: this migration's structures are owned by AddNewsFetchLog1785478533477;
        // that migration's down() already handles cleanup.
    }
}
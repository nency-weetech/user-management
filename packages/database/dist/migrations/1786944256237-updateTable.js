"use strict";
// import { MigrationInterface, QueryRunner } from "typeorm";
Object.defineProperty(exports, "__esModule", { value: true });
// export class UpdateTable1786944256237 implements MigrationInterface {
//     name = 'UpdateTable1786944256237'
//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE "news-fetch-log" DROP CONSTRAINT "FK_3c8edf08014b6c65febc564d5fa"`);
//         await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "keycloakId"`);
//         await queryRunner.query(`ALTER TYPE "public"."new-fetch-log_triggeredby_enum" RENAME TO "new-fetch-log_triggeredby_enum_old"`);
//         await queryRunner.query(`CREATE TYPE "public"."news-fetch-log_triggeredby_enum" AS ENUM('corn', 'admin')`);
//         await queryRunner.query(`ALTER TABLE "news-fetch-log" ALTER COLUMN "triggeredBy" TYPE "public"."news-fetch-log_triggeredby_enum" USING "triggeredBy"::"text"::"public"."news-fetch-log_triggeredby_enum"`);
//         await queryRunner.query(`DROP TYPE "public"."new-fetch-log_triggeredby_enum_old"`);
//         await queryRunner.query(`ALTER TABLE "news-fetch-log" ADD CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7" FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
//     }
//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE "news-fetch-log" DROP CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7"`);
//         await queryRunner.query(`CREATE TYPE "public"."new-fetch-log_triggeredby_enum_old" AS ENUM('corn', 'admin')`);
//         await queryRunner.query(`ALTER TABLE "news-fetch-log" ALTER COLUMN "triggeredBy" TYPE "public"."new-fetch-log_triggeredby_enum_old" USING "triggeredBy"::"text"::"public"."new-fetch-log_triggeredby_enum_old"`);
//         await queryRunner.query(`DROP TYPE "public"."news-fetch-log_triggeredby_enum"`);
//         await queryRunner.query(`ALTER TYPE "public"."new-fetch-log_triggeredby_enum_old" RENAME TO "new-fetch-log_triggeredby_enum"`);
//         await queryRunner.query(`ALTER TABLE "users" ADD "keycloakId" character varying`);
//         await queryRunner.query(`ALTER TABLE "news-fetch-log" ADD CONSTRAINT "FK_3c8edf08014b6c65febc564d5fa" FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
//     }
// }

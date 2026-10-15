"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePDFJobs1791191194881 = void 0;
class CreatePDFJobs1791191194881 {
    name = 'CreatePDFJobs1791191194881';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "pdf_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'queued', "object_key" character varying, "filename" character varying, "error" text, "expires_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_091af0eabc9d351f938e7eed398" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "pdf_jobs_expires_idx" ON "pdf_jobs"  ("expires_at") WHERE "status" = 'ready'`);
        await queryRunner.query(`CREATE INDEX "pdf_jobs_owner_status_idx" ON "pdf_jobs"  ("owner_id", "status") `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."pdf_jobs_owner_status_idx"`);
        await queryRunner.query(`DROP INDEX "public"."pdf_jobs_expires_idx"`);
        await queryRunner.query(`DROP TABLE "pdf_jobs"`);
    }
}
exports.CreatePDFJobs1791191194881 = CreatePDFJobs1791191194881;

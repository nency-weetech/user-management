"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxTable1792403231090 = void 0;
class OutboxTable1792403231090 {
    name = 'OutboxTable1792403231090';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aggregate_type" character varying NOT NULL, "aggregate_id" character varying NOT NULL, "event_type" character varying NOT NULL, "payload" jsonb NOT NULL, "trace_id" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "outbox"`);
    }
}
exports.OutboxTable1792403231090 = OutboxTable1792403231090;

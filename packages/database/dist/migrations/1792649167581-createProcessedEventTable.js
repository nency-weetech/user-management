"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProcessedEventTable1792649167581 = void 0;
class CreateProcessedEventTable1792649167581 {
    name = 'CreateProcessedEventTable1792649167581';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "processed_events" ("event_id" text NOT NULL, "consumer" text NOT NULL, "processed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9d3aec048091ffef44b52e69527" PRIMARY KEY ("event_id", "consumer"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "processed_events"`);
    }
}
exports.CreateProcessedEventTable1792649167581 = CreateProcessedEventTable1792649167581;

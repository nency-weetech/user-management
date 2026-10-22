import { MigrationInterface, QueryRunner } from 'typeorm';

export class OutboxTable1792403231090 implements MigrationInterface {
  name = 'OutboxTable1792403231090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "aggregate_type" character varying NOT NULL, "aggregate_id" character varying NOT NULL, "event_type" character varying NOT NULL, "payload" jsonb NOT NULL, "trace_id" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "outbox"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProcessedEventTable1792649167581 implements MigrationInterface {
  name = 'CreateProcessedEventTable1792649167581';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "processed_events" ("event_id" text NOT NULL, "consumer" text NOT NULL, "processed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9d3aec048091ffef44b52e69527" PRIMARY KEY ("event_id", "consumer"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "processed_events"`);
  }
}

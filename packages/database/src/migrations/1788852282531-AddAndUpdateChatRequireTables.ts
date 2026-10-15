import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAndUpdateChatRequireTables1788852282531 implements MigrationInterface {
  name = 'AddAndUpdateChatRequireTables1788852282531';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news-fetch-log" DROP CONSTRAINT "FK_3c8edf08014b6c65febc564d5fa"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."room_members_role_enum" AS ENUM('admin', 'member')`,
    );
    await queryRunner.query(
      `CREATE TABLE "room_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "room_id" uuid NOT NULL, "role" "public"."room_members_role_enum" NOT NULL DEFAULT 'member', "joined_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ROOM_MEMBER_USER_ROOM" UNIQUE ("user_id", "room_id"), CONSTRAINT "PK_4493fab0433f741b7cf842e6038" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROOM_MEMBERS_USER_ID" ON "room_members"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROOM_MEMBERS_ROOM_ID" ON "room_members"  ("room_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" character varying(500), "owner_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROOMS_OWNER_ID" ON "rooms"  ("owner_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "sender_id" uuid NOT NULL, "room_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGE_SENDER_ID" ON "message"  ("sender_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGE_ROOM_CREATED_AT" ON "message"  ("room_id", "created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "room_members" ADD CONSTRAINT "FK_b2d15baf5b46ed9659bd71fbb43" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_members" ADD CONSTRAINT "FK_e6cf45f179a524427ddf8bacd8e" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD CONSTRAINT "FK_9f38c339cb7a6e33b02f9d2c743" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_a9edf3bbd4fc17c42ee8677b9ce" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "news-fetch-log" ADD CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7" FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news-fetch-log" DROP CONSTRAINT "FK_51fe272002e1ff7f853a29ec3b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_a9edf3bbd4fc17c42ee8677b9ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" DROP CONSTRAINT "FK_9f38c339cb7a6e33b02f9d2c743"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_members" DROP CONSTRAINT "FK_e6cf45f179a524427ddf8bacd8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_members" DROP CONSTRAINT "FK_b2d15baf5b46ed9659bd71fbb43"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_MESSAGE_ROOM_CREATED_AT"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_MESSAGE_SENDER_ID"`);
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ROOMS_OWNER_ID"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ROOM_MEMBERS_ROOM_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ROOM_MEMBERS_USER_ID"`);
    await queryRunner.query(`DROP TABLE "room_members"`);
    await queryRunner.query(`DROP TYPE "public"."room_members_role_enum"`);
    await queryRunner.query(
      `ALTER TABLE "news-fetch-log" ADD CONSTRAINT "FK_3c8edf08014b6c65febc564d5fa" FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}

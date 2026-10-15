import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoomJoinRequests1788863662853 implements MigrationInterface {
    name = 'AddRoomJoinRequests1788863662853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."room_join_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "room_join_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "roomId" uuid NOT NULL, "status" "public"."room_join_requests_status_enum" NOT NULL DEFAULT 'PENDING', "requestedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reviewedById" uuid, "reviewedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f91b62e81481146e49e1b32d09e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_pending_request_per_user_room" ON "room_join_requests"  ("userId", "roomId") WHERE "status" = 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" ADD CONSTRAINT "FK_610425abd8e707232523828d3c2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" ADD CONSTRAINT "FK_69947d24a82493968f9c40839fb" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" ADD CONSTRAINT "FK_ece0e289ed0628b55c45292aba9" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_join_requests" DROP CONSTRAINT "FK_ece0e289ed0628b55c45292aba9"`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" DROP CONSTRAINT "FK_69947d24a82493968f9c40839fb"`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" DROP CONSTRAINT "FK_610425abd8e707232523828d3c2"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_pending_request_per_user_room"`);
        await queryRunner.query(`DROP TABLE "room_join_requests"`);
        await queryRunner.query(`DROP TYPE "public"."room_join_requests_status_enum"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class TestSchemaCheck1790593442243 implements MigrationInterface {
    name = 'TestSchemaCheck1790593442243'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_a9edf3bbd4fc17c42ee8677b9ce"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6"`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" DROP CONSTRAINT "FK_ece0e289ed0628b55c45292aba9"`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" DROP CONSTRAINT "FK_69947d24a82493968f9c40839fb"`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" DROP CONSTRAINT "FK_610425abd8e707232523828d3c2"`);
        await queryRunner.query(`ALTER TABLE "user_plans" DROP CONSTRAINT "FK_8610c75af23c280cd20cd2d1ffa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_profiles_one_default_per_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_profiles_user_id"`);
        await queryRunner.query(`ALTER TYPE "public"."news-fetch-log_triggeredby_enum" RENAME TO "news-fetch-log_triggeredby_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."news_fetch_logs_trigger_type_enum" AS ENUM('corn', 'admin')`);
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" ALTER COLUMN "trigger_type" TYPE "public"."news_fetch_logs_trigger_type_enum" USING "trigger_type"::"text"::"public"."news_fetch_logs_trigger_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."news-fetch-log_triggeredby_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."Payments_plan_enum" RENAME TO "Payments_plan_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_plan_enum" AS ENUM('free', 'pro', 'max')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "plan" TYPE "public"."payments_plan_enum" USING "plan"::"text"::"public"."payments_plan_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Payments_plan_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."Payments_status_enum" RENAME TO "Payments_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'succeeded', 'failed', 'refunded', 'expired')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum" USING "status"::"text"::"public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."Payments_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."UserPlan_plan_enum" RENAME TO "UserPlan_plan_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_plans_plan_enum" AS ENUM('free', 'pro', 'max')`);
        await queryRunner.query(`ALTER TABLE "user_plans" ALTER COLUMN "plan" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_plans" ALTER COLUMN "plan" TYPE "public"."user_plans_plan_enum" USING "plan"::"text"::"public"."user_plans_plan_enum"`);
        await queryRunner.query(`ALTER TABLE "user_plans" ALTER COLUMN "plan" SET DEFAULT 'free'`);
        await queryRunner.query(`DROP TYPE "public"."UserPlan_plan_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_9e432b7df0d182f8d292902d1a" ON "profiles"  ("user_id") `);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_1dda4fc8dbeeff2ee71f0088ba0" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" ADD CONSTRAINT "FK_dece2a37274f5264265f9cbaf96" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" ADD CONSTRAINT "FK_f8a2d7ac46e94eb78397f2385d1" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" ADD CONSTRAINT "FK_c9de7b0d4ea63d8d91fede661ed" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_plans" ADD CONSTRAINT "FK_638ae53bcdc1ff763dd5199f486" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_plans" DROP CONSTRAINT "FK_638ae53bcdc1ff763dd5199f486"`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" DROP CONSTRAINT "FK_c9de7b0d4ea63d8d91fede661ed"`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" DROP CONSTRAINT "FK_f8a2d7ac46e94eb78397f2385d1"`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" DROP CONSTRAINT "FK_dece2a37274f5264265f9cbaf96"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_1dda4fc8dbeeff2ee71f0088ba0"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_22133395bd13b970ccd0c34ab22"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e432b7df0d182f8d292902d1a"`);
        await queryRunner.query(`CREATE TYPE "public"."UserPlan_plan_enum_old" AS ENUM('free', 'pro', 'max')`);
        await queryRunner.query(`ALTER TABLE "user_plans" ALTER COLUMN "plan" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_plans" ALTER COLUMN "plan" TYPE "public"."UserPlan_plan_enum_old" USING "plan"::"text"::"public"."UserPlan_plan_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_plans" ALTER COLUMN "plan" SET DEFAULT 'free'`);
        await queryRunner.query(`DROP TYPE "public"."user_plans_plan_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."UserPlan_plan_enum_old" RENAME TO "UserPlan_plan_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."Payments_status_enum_old" AS ENUM('pending', 'succeeded', 'failed', 'refunded', 'expired')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."Payments_status_enum_old" USING "status"::"text"::"public"."Payments_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."Payments_status_enum_old" RENAME TO "Payments_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."Payments_plan_enum_old" AS ENUM('free', 'pro', 'max')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "plan" TYPE "public"."Payments_plan_enum_old" USING "plan"::"text"::"public"."Payments_plan_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."payments_plan_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."Payments_plan_enum_old" RENAME TO "Payments_plan_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."news-fetch-log_triggeredby_enum_old" AS ENUM('corn', 'admin')`);
        await queryRunner.query(`ALTER TABLE "news_fetch_logs" ALTER COLUMN "trigger_type" TYPE "public"."news-fetch-log_triggeredby_enum_old" USING "trigger_type"::"text"::"public"."news-fetch-log_triggeredby_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."news_fetch_logs_trigger_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."news-fetch-log_triggeredby_enum_old" RENAME TO "news-fetch-log_triggeredby_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_profiles_user_id" ON "profiles" USING btree ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_profiles_one_default_per_user" ON "profiles" USING btree ("user_id") WHERE (is_default = true)`);
        await queryRunner.query(`ALTER TABLE "user_plans" ADD CONSTRAINT "FK_8610c75af23c280cd20cd2d1ffa" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" ADD CONSTRAINT "FK_610425abd8e707232523828d3c2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" ADD CONSTRAINT "FK_69947d24a82493968f9c40839fb" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_join_requests" ADD CONSTRAINT "FK_ece0e289ed0628b55c45292aba9" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_a9edf3bbd4fc17c42ee8677b9ce" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

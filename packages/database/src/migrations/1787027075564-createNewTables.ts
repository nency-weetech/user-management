import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNewTables1787027075564 implements MigrationInterface {
    name = 'CreateNewTables1787027075564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Payments_status_enum" AS ENUM('pending', 'succeeded', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "Payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying, "stripeCheckoutSessionId" character varying NOT NULL, "stripePaymentIntentId" character varying, "amount" integer NOT NULL, "currency" character varying NOT NULL, "status" "public"."Payments_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c317e4333232b25bffcf331b8bb" UNIQUE ("stripeCheckoutSessionId"), CONSTRAINT "PK_50c3077812277d7b8c68c54d61a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."UserPlan_plan_enum" AS ENUM('free', 'paid')`);
        await queryRunner.query(`CREATE TABLE "UserPlan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "plan" "public"."UserPlan_plan_enum" NOT NULL DEFAULT 'free', "planUpgradedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_509648c3422046debfe18e2acc0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "UserUsage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying, "dailyArticleViewCount" integer NOT NULL DEFAULT '0', "dailyArticleViewResetAt" TIMESTAMP, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_a1533fed67f9f86b226628c92ae" UNIQUE ("userId"), CONSTRAINT "PK_f301bdf2bb99c75ea71ac558469" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "UserUsage"`);
        await queryRunner.query(`DROP TABLE "UserPlan"`);
        await queryRunner.query(`DROP TYPE "public"."UserPlan_plan_enum"`);
        await queryRunner.query(`DROP TABLE "Payments"`);
        await queryRunner.query(`DROP TYPE "public"."Payments_status_enum"`);
    }

}

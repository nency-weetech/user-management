import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizationPlan1790140184436 implements MigrationInterface {
    name = 'AddOrganizationPlan1790140184436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."organization_plans_plan_enum" AS ENUM('free', 'pro', 'max')`);
        await queryRunner.query(`CREATE TABLE "organization_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "plan" "public"."organization_plans_plan_enum" NOT NULL DEFAULT 'free', "plan_upgraded_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_1641d6e6f184dd2876c6be876f4" UNIQUE ("organization_id"), CONSTRAINT "PK_da81b8c2e34901ae35a54a8af49" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "organization_plans" ADD CONSTRAINT "FK_1641d6e6f184dd2876c6be876f4" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_plans" DROP CONSTRAINT "FK_1641d6e6f184dd2876c6be876f4"`);
        await queryRunner.query(`DROP TABLE "organization_plans"`);
        await queryRunner.query(`DROP TYPE "public"."organization_plans_plan_enum"`);
    }

}

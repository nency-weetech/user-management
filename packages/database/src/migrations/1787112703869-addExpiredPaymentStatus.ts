import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpiredPaymentStatus1787112703869 implements MigrationInterface {
    name = 'AddExpiredPaymentStatus1787112703869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."Payments_status_enum" ADD VALUE 'expired'`);
        await queryRunner.query(`ALTER TABLE "UserPlan" ADD CONSTRAINT "FK_8610c75af23c280cd20cd2d1ffa" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "UserPlan" DROP CONSTRAINT "FK_8610c75af23c280cd20cd2d1ffa"`);
        await queryRunner.query(`CREATE TYPE "public"."Payments_status_enum_old" AS ENUM('pending', 'succeeded', 'failed', 'refunded')`);
        await queryRunner.query(`ALTER TABLE "Payments" ALTER COLUMN "status" TYPE "public"."Payments_status_enum_old" USING "status"::"text"::"public"."Payments_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."Payments_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."Payments_status_enum_old" RENAME TO "Payments_status_enum"`);
    }

}

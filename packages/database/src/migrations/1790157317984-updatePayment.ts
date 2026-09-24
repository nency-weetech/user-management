import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePayment1790157317984 implements MigrationInterface {
    name = 'UpdatePayment1790157317984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "organization_id" uuid`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "userId" uuid`);     
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_fc07ace491143726974991711f2" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_fc07ace491143726974991711f2"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1"`); 
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "organization_id"`);  
    }

}

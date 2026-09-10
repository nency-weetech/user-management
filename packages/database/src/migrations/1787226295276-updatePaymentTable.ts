import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePaymentTable1787226295276 implements MigrationInterface {
  name = 'UpdatePaymentTable1787226295276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Payments" ALTER COLUMN "stripeCheckoutSessionId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payments" DROP CONSTRAINT "UQ_c317e4333232b25bffcf331b8bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payments" ALTER COLUMN "stripePaymentIntentId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payments" ADD CONSTRAINT "UQ_65b7d9b9815db575149711bca3f" UNIQUE ("stripePaymentIntentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payments" ALTER COLUMN "plan" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Payments" ALTER COLUMN "plan" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payments" DROP CONSTRAINT "UQ_65b7d9b9815db575149711bca3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payments" ALTER COLUMN "stripePaymentIntentId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payments" ADD CONSTRAINT "UQ_c317e4333232b25bffcf331b8bb" UNIQUE ("stripeCheckoutSessionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payments" ALTER COLUMN "stripeCheckoutSessionId" SET NOT NULL`,
    );
  }
}

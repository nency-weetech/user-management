"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDiscountCode1790930896503 = void 0;
class AddDiscountCode1790930896503 {
    name = 'AddDiscountCode1790930896503';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "discount_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "flat_amount" integer NOT NULL, "currency" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "expires_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6361a4ded06767387d552a0dc95" UNIQUE ("code"), CONSTRAINT "PK_2bc990ea493af6ba53b217ee985" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "subtotal_amount" integer`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "discount_amount" integer`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "tax_amount" integer`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "coupon_code" character varying`);
        await queryRunner.query(`CREATE UNIQUE INDEX "payments_stripe_invoice_id_uq" ON "payments"  ("stripe_invoice_id") WHERE "stripe_invoice_id" IS NOT NULL`);
        if (process.env.NODE_ENV !== 'production') {
            await queryRunner.query(`
        INSERT INTO discount_codes (code, flat_amount, currency, is_active, expires_at) VALUES
          ('SAVE10',   1000,  'inr', true,  NULL),
          ('EXPIRED5', 500,   'inr', true,  now() - interval '1 day'),
          ('OFF20',    2000,  'inr', false, NULL),
          ('BIG200',   20000, 'inr', true,  NULL)
        ON CONFLICT (code) DO NOTHING
      `);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."payments_stripe_invoice_id_uq"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "coupon_code"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "tax_amount"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "discount_amount"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "subtotal_amount"`);
        await queryRunner.query(`DROP TABLE "discount_codes"`);
    }
}
exports.AddDiscountCode1790930896503 = AddDiscountCode1790930896503;

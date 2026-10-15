import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedLedgerAccount1790657029565 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select id from pgledger_create_account('stripe_clearing', 'INR')`),
        await queryRunner.query(`select id from pgledger_create_account('sales_revenue', 'INR')`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`delete from pgledger_accounts where name in ('stripe_clearing', 'sales_revenue')`)
    }
}

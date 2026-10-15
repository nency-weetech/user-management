"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedLedgerAccount1790657029565 = void 0;
class SeedLedgerAccount1790657029565 {
    async up(queryRunner) {
        await queryRunner.query(`select id from pgledger_create_account('stripe_clearing', 'INR')`),
            await queryRunner.query(`select id from pgledger_create_account('sales_revenue', 'INR')`);
    }
    async down(queryRunner) {
        await queryRunner.query(`delete from pgledger_accounts where name in ('stripe_clearing', 'sales_revenue')`);
    }
}
exports.SeedLedgerAccount1790657029565 = SeedLedgerAccount1790657029565;

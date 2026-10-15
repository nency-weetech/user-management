"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pgledger1790595505294 = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const sqlDir = (0, path_1.join)(__dirname, '../pgledger');
const files = ['ulid-to-uuid.sql', 'uuid-to-ulid.sql', 'pgledger.sql'];
class Pgledger1790595505294 {
    async up(queryRunner) {
        for (const file of files) {
            await queryRunner.query((0, fs_1.readFileSync)((0, path_1.join)(sqlDir, file), 'utf8'));
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP VIEW IF EXISTS pgledger_entries_view, pgledger_transfers_view, pgledger_accounts_view CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS pgledger_entries, pgledger_transfers, pgledger_accounts CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS TRANSFER_REQUEST CASCADE;`);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS pgledger_create_transfers(TRANSFER_REQUEST[], TIMESTAMPTZ, JSONB);
            DROP FUNCTION IF EXISTS pgledger_create_transfers(TRANSFER_REQUEST[]);
            DROP FUNCTION IF EXISTS pgledger_create_transfer(TEXT, TEXT, NUMERIC, TIMESTAMPTZ, JSONB);
            DROP FUNCTION IF EXISTS pgledger_check_account_balance_constraints(PGLEDGER_ACCOUNTS);
            DROP FUNCTION IF EXISTS pgledger_create_account(TEXT, TEXT, BOOLEAN, BOOLEAN, JSONB);
            DROP FUNCTION IF EXISTS pgledger_generate_id(TEXT);
            DROP FUNCTION IF EXISTS pgledger_uuidv7();
            DROP FUNCTION IF EXISTS pgledger_uuidv7_microsecond();
            DROP FUNCTION IF EXISTS pgledger_uuidv7_exists();
            DROP FUNCTION IF EXISTS uuid_to_ulid(uuid);
            DROP FUNCTION IF EXISTS format_ulid(bytea);
            DROP FUNCTION IF EXISTS ulid_to_uuid(text);
            DROP FUNCTION IF EXISTS parse_ulid(text);
        `);
    }
}
exports.Pgledger1790595505294 = Pgledger1790595505294;

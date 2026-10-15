CREATE TABLE IF NOT EXISTS benchmark_accounts (
    account_no INTEGER PRIMARY KEY,
    account_id TEXT NOT NULL
);

TRUNCATE benchmark_accounts;

DO $$
DECLARE
    i INTEGER;
    account_record RECORD;
BEGIN
    FOR i IN 1..50 LOOP

        SELECT *
        INTO account_record
        FROM pgledger_create_account(
            'benchmark_account_' || i,
            'INR',
            TRUE,
            TRUE,
            jsonb_build_object(
                'benchmark', true,
                'account_no', i
            )
        );

        INSERT INTO benchmark_accounts (account_no, account_id)
        VALUES (i, account_record.id);

    END LOOP;
END $$;
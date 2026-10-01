\set direction random(1, 2)

SELECT pgledger_create_transfer(
    (
        SELECT account_id
        FROM benchmark_accounts
        WHERE account_no = CASE
            WHEN :direction = 1 THEN 1
            ELSE 2
        END
    ),
    (
        SELECT account_id
        FROM benchmark_accounts
        WHERE account_no = CASE
            WHEN :direction = 1 THEN 2
            ELSE 1
        END
    ),
    100,
    now(),
    '{"benchmark": true, "test": "hot_contention"}'::jsonb
);
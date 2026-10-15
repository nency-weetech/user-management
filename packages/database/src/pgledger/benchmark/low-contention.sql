\set from_id random(1, 50)
\set to_id random(1, 49)

SELECT pgledger_create_transfer(
    (
        SELECT account_id
        FROM benchmark_accounts
        WHERE account_no = :from_id
    ),
    (
        SELECT account_id
        FROM benchmark_accounts
        WHERE account_no =
            CASE
                WHEN :to_id >= :from_id
                THEN :to_id + 1
                ELSE :to_id
            END
    ),
    100,
    now(),
    '{"benchmark": true, "test": "low_contention"}'::jsonb
);
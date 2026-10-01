\set from_id random(1, 50)
\set to_id random(1, 50)
SELECT pgledger_create_transfer(
  (SELECT id FROM pgledger_accounts WHERE name = 'test_account_' || :from_id),
  (SELECT id FROM pgledger_accounts WHERE name = 'test_account_' || :to_id),
  1.00
);

import { MigrationInterface, QueryRunner } from 'typeorm';

export class SaleSummaryMV1790665730319 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW sales_summary_mv AS
      SELECT
        TO_CHAR(DATE(e.event_at), 'YYYY-MM-DD') AS sale_date,
        e.metadata ->> 'plan' AS plan,
        e.metadata ->> 'target_type' AS target_type,
        SUM(e.amount) AS total_sales,
        CASE
        WHEN e.metadata->>'target_type' = 'USER'
            THEN COUNT(DISTINCT p.user_id)

        WHEN e.metadata->>'target_type' = 'ORG'
            THEN COUNT(DISTINCT p.organization_id)

        ELSE 0
        END AS subscriber_count
      FROM pgledger_entries_view e
      JOIN pgledger_accounts_view a
        ON a.id = e.account_id
      LEFT JOIN payments p 
        ON p.id::text = e.metadata ->> 'payment_id'
      WHERE a.name = 'sales_revenue'
        AND e.amount > 0
      GROUP BY
        DATE(e.event_at),
        e.metadata ->> 'plan',
        e.metadata ->> 'target_type'
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_sales_summary_mv
      ON sales_summary_mv (sale_date, plan, target_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS sales_summary_mv;
    `);
  }
}

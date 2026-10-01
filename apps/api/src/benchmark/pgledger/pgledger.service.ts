import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'pgledger_loadtest_100k',
});

@Injectable()
export class PgledgerService {
  async createTransfer(
    from_account_id: string,
    to_account_id: string,
    amount: number,
  ) {
    
    const result = await pool.query(
      `
      SELECT *
      FROM pgledger_create_transfer($1, $2, $3, $4, $5)
      `,
      [
        from_account_id,
        to_account_id,
        amount,
        new Date(),
        JSON.stringify({
          benchmark: true,
          test: 'k6',
        }),
      ],
    );

    console.log(result.rows);

    return result.rows;
  }

  async getBenchmarkAccount (){
    const result = await pool.query(
        `
        select account_no, account_id
        from benchmark_accounts
        order by account_no 
        `
    )

    return result.rows;
  }
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { PgledgerService } from './pgledger.service';

@Controller('benchmark/pgledger')
export class PgledgerController {
  constructor(private readonly pgledgerService: PgledgerService) {}

  @Post('transfer')
  async createTransfer(
    @Body()
    body: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
    },
  ) {
    return this.pgledgerService.createTransfer(
      body.fromAccountId,
      body.toAccountId,
      body.amount,
    );
  }

  @Get('accounts')
  async getAccounts() {
    return this.pgledgerService.getBenchmarkAccount();
  }
}

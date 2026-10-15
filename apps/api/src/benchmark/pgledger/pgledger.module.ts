import { Module } from '@nestjs/common';
import { PgledgerController } from './pgledger.controller';
import { PgledgerService } from './pgledger.service';

@Module({
  controllers: [PgledgerController],
  providers: [PgledgerService]
})
export class PgledgerModule {}

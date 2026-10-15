import { Test, TestingModule } from '@nestjs/testing';
import { PgledgerService } from './pgledger.service';

describe('PgledgerService', () => {
  let service: PgledgerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PgledgerService],
    }).compile();

    service = module.get<PgledgerService>(PgledgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

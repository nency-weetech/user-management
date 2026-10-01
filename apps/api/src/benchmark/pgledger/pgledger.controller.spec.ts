import { Test, TestingModule } from '@nestjs/testing';
import { PgledgerController } from './pgledger.controller';

describe('PgledgerController', () => {
  let controller: PgledgerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PgledgerController],
    }).compile();

    controller = module.get<PgledgerController>(PgledgerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteService } from './soft-delete.service';

describe('SoftDeleteService', () => {
  let service: SoftDeleteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoftDeleteService],
    }).compile();

    service = module.get<SoftDeleteService>(SoftDeleteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SignUpCountService } from './sign-up-count.service';

describe('SignUpCountService', () => {
  let service: SignUpCountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignUpCountService],
    }).compile();

    service = module.get<SignUpCountService>(SignUpCountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

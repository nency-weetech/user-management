import { Test, TestingModule } from '@nestjs/testing';
import { ChatStorage } from './minio.service';

describe('MinioService', () => {
  let service: ChatStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatStorage],
    }).compile();

    service = module.get<ChatStorage>(ChatStorage);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

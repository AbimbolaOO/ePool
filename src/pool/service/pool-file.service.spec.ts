import { Test, TestingModule } from '@nestjs/testing';
import { PoolFileService } from './pool-file.service';

describe('PoolFileService', () => {
  let service: PoolFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoolFileService],
    }).compile();

    service = module.get<PoolFileService>(PoolFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

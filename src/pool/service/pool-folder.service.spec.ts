import { Test, TestingModule } from '@nestjs/testing';
import { PoolFolderService } from './pool-folder.service';

describe('PoolFolderService', () => {
  let service: PoolFolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoolFolderService],
    }).compile();

    service = module.get<PoolFolderService>(PoolFolderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

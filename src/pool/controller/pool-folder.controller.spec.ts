import { Test, TestingModule } from '@nestjs/testing';
import { PoolFolderController } from './pool-folder.controller';

describe('PoolFolderController', () => {
  let controller: PoolFolderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoolFolderController],
    }).compile();

    controller = module.get<PoolFolderController>(PoolFolderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

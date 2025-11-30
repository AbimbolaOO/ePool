import { Test, TestingModule } from '@nestjs/testing';
import { PoolFileController } from './pool-file.controller';

describe('PoolFileController', () => {
  let controller: PoolFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoolFileController],
    }).compile();

    controller = module.get<PoolFileController>(PoolFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

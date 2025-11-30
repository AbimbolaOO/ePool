import { Test, TestingModule } from '@nestjs/testing';
import { PoolMemberController } from './pool-member.controller';

describe('PoolMemberController', () => {
  let controller: PoolMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoolMemberController],
    }).compile();

    controller = module.get<PoolMemberController>(PoolMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

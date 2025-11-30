import { Test, TestingModule } from '@nestjs/testing';
import { PoolMemberService } from './pool-member.service';

describe('PoolMemberService', () => {
  let service: PoolMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoolMemberService],
    }).compile();

    service = module.get<PoolMemberService>(PoolMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

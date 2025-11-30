import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../auth/entity/user.entity';
import { PoolFileController } from './controller/pool-file.controller';
import { PoolFolderController } from './controller/pool-folder.controller';
import { PoolMemberController } from './controller/pool-member.controller';
import { PoolFile } from './entity/pool-file.entity';
import { PoolFolder } from './entity/pool-folder.entity';
import { PoolMember } from './entity/pool-member.entity';
import { PoolFileService } from './service/pool-file.service';
import { PoolMemberService } from './service/pool-member.service';
import { PoolService } from './service/pool.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PoolFolder, PoolMember, PoolFile, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),],
  controllers: [PoolFolderController, PoolFileController, PoolMemberController],
  providers: [PoolService, PoolFileService, PoolMemberService],
  exports: [PoolService, PoolFileService, PoolMemberService],
})
export class PoolModule {}

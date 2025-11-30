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
import { PoolFolderService } from './service/pool-folder.service';
import { PoolMemberService } from './service/pool-member.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PoolFolder, PoolMember, PoolFile, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),],
  controllers: [PoolFolderController, PoolFileController, PoolMemberController],
  providers: [PoolFolderService, PoolFileService, PoolMemberService],
  exports: [PoolFolderService, PoolFileService, PoolMemberService],
})
export class PoolModule {}

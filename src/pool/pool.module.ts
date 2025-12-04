import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entity/user.entity';
import { DigitalOceanSpacesModule } from '../digital-ocean-spaces';
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
    AuthModule,
    DigitalOceanSpacesModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        accessKeyId: configService.getOrThrow<string>(
          'DO_SPACES_ACCESS_KEY_ID',
        ),
        secretAccessKey: configService.getOrThrow<string>(
          'DO_SPACES_SECRET_ACCESS_KEY',
        ),
        region: configService.get<string>('DO_SPACES_REGION', 'fra1'),
        bucketName: configService.getOrThrow<string>('DO_SPACES_BUCKET_NAME'),
        endpoint: configService.get<string>('DO_SPACES_ENDPOINT'),
      }),
    }),
    TypeOrmModule.forFeature([PoolFolder, PoolMember, PoolFile, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [PoolFolderController, PoolFileController, PoolMemberController],
  providers: [PoolFolderService, PoolFileService, PoolMemberService],
  exports: [PoolFolderService, PoolFileService, PoolMemberService],
})
export class PoolModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entity/user.entity';
import { AppDataSource } from './data-source';
import { NotificationModule } from './notification/notification.module';
import { PoolFile } from './pool/entity/pool-file.entity';
import { PoolFolder } from './pool/entity/pool-folder.entity';
import { PoolMember } from './pool/entity/pool-member.entity';
import { PoolModule } from './pool/pool.module';
import { RdbModule } from './redisdb/rdb.module';

@Module({
  imports: [
    RdbModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
    AuthModule,
    PoolModule,
    NotificationModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...AppDataSource.options,
        autoLoadEntities: true
      })
    }),

    TypeOrmModule.forFeature([
      User,
      PoolMember,
      PoolFolder,
      PoolFile,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

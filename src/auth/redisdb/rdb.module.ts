import jwtConfig from 'src/utils/config/jwt.config';

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RdbService } from './rdb.service';

const redisStore = require('cache-manager-redis-store').redisStore;
@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        url: configService.getOrThrow<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [RdbService],
  exports: [RdbService],
})
export class RdbModule {}

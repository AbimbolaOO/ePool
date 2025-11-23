import jwtConfig from 'src/utils/config/jwt.config';

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RdbService } from './rdb.service';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),

    BullModule.registerQueueAsync({
      name: 'redis-connection',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
          // tls: process.env.NODE_ENV === 'production' ? {} : undefined,
          maxRetriesPerRequest: null,
          lazyConnect: true,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RdbService],
  exports: [RdbService],
})
export class RdbModule {}

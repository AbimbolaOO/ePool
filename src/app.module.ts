import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entity/user.entity';
import { AppDataSource } from './data-source';
import { NotificationModule } from './notification/notification.module';
import { PoolModule } from './pool/pool.module';

@Module({
  imports: [
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
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

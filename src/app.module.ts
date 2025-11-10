import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { PoolModule } from './pool/pool.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
    AuthModule, PoolModule, NotificationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

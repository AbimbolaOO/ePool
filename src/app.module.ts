import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { PoolModule } from './pool/pool.module';

@Module({
  imports: [AuthenticationModule, PoolModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

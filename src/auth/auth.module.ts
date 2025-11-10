import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { UserService } from './service/user.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService]
})
export class AuthModule {}

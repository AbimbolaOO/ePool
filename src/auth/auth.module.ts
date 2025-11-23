import jwtConfig from 'src/utils/config/jwt.config';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationModule } from '../notification/notification.module';
import { RdbModule } from '../redisdb/rdb.module';
import { AuthController } from './controller/auth.controller';
import { User } from './entity/user.entity';
import { AuthService } from './service/auth.service';
import { UserService } from './service/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RdbModule,
    NotificationModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultsecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
  exports: [AuthService, UserService],
})
export class AuthModule {}

import { Queue } from 'bullmq';
import Redis, { Cluster } from 'ioredis';
import { CONSTANTS } from 'src/enum/constants.enum';
import jwtConfig from 'src/utils/config/jwt.config';

import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class RdbService implements OnModuleInit {
  private readonly logger = new Logger(RdbService.name);
  private redisClient: Redis | Cluster;

  constructor(
    @InjectQueue('redis-connection') private readonly redisQueue: Queue,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async onModuleInit() {
    this.redisClient = await this.redisQueue.client;
    this.logger.log('Redis client initialized via BullMQ');
  }

  async storeRefreshTokenId(userId: string, randomId: string) {
    await this.redisClient.set(
      `refresh-token:${userId}`,
      randomId,
      'EX',
      this.jwtConfiguration.refreshTokenTtl,
    );
  }

  async getRefreshTokenId(userId: string): Promise<string | null> {
    return await this.redisClient.get(`refresh-token:${userId}`);
  }

  async storeSignUpOtp(emailOrPhone: string, otp: string) {
    await this.redisClient.set(
      `signup:otp:${emailOrPhone}`,
      otp,
      'EX',
      CONSTANTS.TTL_10_MIN,
    );
  }

  async getSignUpOtp(emailOrPhone: string): Promise<string | null> {
    return await this.redisClient.get(`signup:otp:${emailOrPhone}`);
  }

  async deleteSignUpOtp(emailOrPhone: string) {
    await this.redisClient.del(`signup:otp:${emailOrPhone}`);
  }

  async storePasswordResetOtp(email: string, otp: string) {
    await this.redisClient.set(
      `password-reset:otp:${email}`,
      otp,
      'EX',
      CONSTANTS.TTL_10_MIN,
    );
  }

  async getPasswordResetOtp(email: string): Promise<string | null> {
    return await this.redisClient.get(`password-reset:otp:${email}`);
  }

  async deletePasswordResetOtp(email: string) {
    await this.redisClient.del(`password-reset:otp:${email}`);
  }

  async storeAdminPasswordResetOtp(otp: string, email: string) {
    await this.redisClient.set(
      `admin-password-reset:otp:${otp}`,
      email,
      'EX',
      CONSTANTS.TTL_10_MIN,
    );
  }

  async getAdminPasswordResetOtp(otp: string): Promise<string | null> {
    return await this.redisClient.get(`admin-password-reset:otp:${otp}`);
  }

  async storeUserAccountDeleteOtpData(otp: string, data: string) {
    await this.redisClient.set(
      `delete-user:otp:${otp}`,
      data,
      'EX',
      CONSTANTS.TTL_10_MIN,
    );
  }

  async getUserAccountDeleteOtpData(otp: string): Promise<string | null> {
    return await this.redisClient.get(`delete-user:otp:${otp}`);
  }

  async storeResetUsernameOtp(userId: string, otp: string) {
    await this.redisClient.set(
      `reset-username:otp:${userId}`,
      otp,
      'EX',
      CONSTANTS.TTL_10_MIN,
    );
  }

  async getResetUsernameOtp(userId: string): Promise<string | null> {
    return await this.redisClient.get(`reset-username:otp:${userId}`);
  }

  async storeEmailSetOtp(userId: string, otp: string) {
    await this.redisClient.set(
      `set-email:otp:${userId}`,
      otp,
      'EX',
      CONSTANTS.TTL_10_MIN,
    );
  }

  async getEmailSetOtp(userId: string): Promise<string | null> {
    return await this.redisClient.get(`set-email:otp:${userId}`);
  }

  async storePhoneSetOtp(userId: string, otp: string) {
    await this.redisClient.set(
      `set-phone:otp:${userId}`,
      otp,
      'EX',
      CONSTANTS.TTL_10_MIN,
    );
  }

  async getPhoneSetOtp(userId: string): Promise<string | null> {
    return await this.redisClient.get(`set-phone:otp:${userId}`);
  }

  async storeTrackWrongPasswordUsage(userId: string, count: number) {
    await this.redisClient.set(
      `wrong-password-usage:user-id:${userId}`,
      count.toString(),
      'EX',
      CONSTANTS.TTL_3_HR,
    );
  }

  async getTrackWrongPasswordUsage(userId: string): Promise<string | null> {
    return await this.redisClient.get(`wrong-password-usage:user-id:${userId}`);
  }

  async getTrackWrongPasswordTTL(userId: string): Promise<number> {
    return await this.redisClient.ttl(`wrong-password-usage:user-id:${userId}`);
  }

  // disconnect on shutdown
  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}

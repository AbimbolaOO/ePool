import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
import { CONSTANTS } from 'src/enum/constants.enum';
import jwtConfig from 'src/utils/config/jwt.config';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class RdbService {
  private readonly redisStore!: RedisStore;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    this.redisStore = cacheManager.store as unknown as RedisStore;
  }

  async storeRefreshTokenId(key: string, randomId: string) {
    const client = this.redisStore.getClient();
    await client.SET(`refresh-token:${key}`, randomId, {
      EX: this.jwtConfiguration.refreshTokenTtl,
    });
  }

  async getRefreshTokenId(key: string) {
    const client = this.redisStore.getClient();
    return await client.GET(`refresh-token:${key}`);
  }

  async storeSignUpOtp(key: string, otp: string) {
    const client = this.redisStore.getClient();
    await client.SET(`signup:otp:${key}`, otp, { EX: Number(CONSTANTS.TTL_10_MIN) });
  }

  async getSignUpOtp(key: string) {
    const client = this.redisStore.getClient();
    return await client.GET(`signup:otp:${key}`);
  }

  async storePasswordResetOtp(key: string, otp: string) {
    const client = this.redisStore.getClient();
    await client.SET(`password-reset:otp:${key}`, otp, { EX: Number(CONSTANTS.TTL_10_MIN) });
  }

  async getPasswordResetOtp(key: string) {
    const client = this.redisStore.getClient();
    return await client.GET(`password-reset:otp:${key}`);
  }

  async storeAdminPasswordResetOtp(otp: string, email: string) {
    const client = this.redisStore.getClient();
    await client.SET(`admin-password-reset:otp:${otp}`, email, {
      EX: Number(CONSTANTS.TTL_10_MIN),
    });
  }

  async getAdminPasswordResetOtp(otp: string) {
    const client = this.redisStore.getClient();
    return await client.GET(`admin-password-reset:otp:${otp}`);
  }

  async storeUserAccountDeleteOtpData(otp: string, data: string) {
    const client = this.redisStore.getClient();
    await client.SET(`delete-user:otp:${otp}`, data, { EX: Number(CONSTANTS.TTL_10_MIN) });
  }

  async getUserAccountDeleteOtpData(otp: string) {
    const client = this.redisStore.getClient();
    return await client.GET(`delete-user:otp:${otp}`);
  }

  async storeResetUsernameOtp(key: string, otp: string) {
    const client = this.redisStore.getClient();
    await client.SET(`reset-username:otp:${key}`, otp, { EX: Number(CONSTANTS.TTL_10_MIN) });
  }

  async getResetUsernameOtp(key: string) {
    const client = this.redisStore.getClient();
    return await client.GET(`reset-username:otp:${key}`);
  }

  async storeEmailSetOtp(key: string, otp: string) {
    const client = this.redisStore.getClient();
    await client.SET(`set-email:otp:${key}`, otp, { EX: Number(CONSTANTS.TTL_10_MIN) });
  }

  async getEmailSetOtp(key: string) {
    const client = this.redisStore.getClient();
    return await client.GET(`set-email:otp:${key}`);
  }

  async storePhoneSetOtp(key: string, otp: string) {
    const client = this.redisStore.getClient();
    await client.SET(`set-phone:otp:${key}`, otp, { EX: Number(CONSTANTS.TTL_10_MIN) });
  }

  async getPhoneSetOtp(key: string) {
    const client = this.redisStore.getClient();
    return await client.GET(`set-phone:otp:${key}`);
  }

  async storeTrackWrongPasswordUsage(key: string, count: string) {
    const client = this.redisStore.getClient();
    await client.SET(`wrong-password-usage:user-id:${key}`, count.toString(), {
      EX: Number(CONSTANTS.TTL_3_HR),
    });
  }

  async getTrackWrongPasswordUsage(key: string) {
    const client = this.redisStore.getClient();
    return await client.GET(`wrong-password-usage:user-id:${key}`);
  }

  async getTrackWrongPasswordTTL(key: string) {
    const client = this.redisStore.getClient();
    return await client.TTL(`wrong-password-usage:user-id:${key}`);
  }
}

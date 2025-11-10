import { randomUUID } from 'crypto';
import { ERROR_MESSAGES } from 'src/enum/responses.enum';
import { IJwtPayLoadData } from 'src/interface';
import jwtConfig from 'src/utils/config/jwt.config';
import { compareHash, createHash } from 'src/utils/utils';
import { QueryFailedError, Repository } from 'typeorm';
import { DataSource } from 'typeorm/browser';
import { UUID } from 'typeorm/browser/driver/mongodb/bson.typings.js';

import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { InAppPasswordResetDto } from '../dto/Inapp-password-reset-dto';
import { User } from '../entity/user.entity';
import { RdbService } from '../redisdb/rdb.service';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        private userService: UserService,
        private readonly dataSource: DataSource,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly rdbService: RdbService,
        private jwtService: JwtService,
    ) {}

    async signUp(signupData) {
        try {
            signupData.password = await createHash(signupData.password);
            await this.userService.create({ ...signupData });
        } catch (err) {
            if (
                err instanceof QueryFailedError &&
                err.message.includes(ERROR_MESSAGES.UNIQUE_CONSTRAINT)
            ) {
                throw new HttpException(
                    ERROR_MESSAGES.ACCOUNT_ALREADY_EXIST_KINDLY_LOGIN,
                    HttpStatus.CONFLICT,
                );
            } else if (err instanceof QueryFailedError) {
                throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                throw new HttpException(
                    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }


    async verifySignup(verificationData: Partial<User>) {
        const email = verificationData.email;
        const signupData = { isVerified: true };
        if (email) {
            signupData['emailVerifiedAt'] = new Date();
        }

        const verifiedUser = await this.userService.update(
            signupData,
            email
        );

        const { accessToken, refreshToken } = await this.generateTokens(
            verifiedUser as User,
        );

        const signInResData = {
            ...verifiedUser,
            authCredentials: {
                accessToken,
                refreshToken,
                accessTokenTtl: this.jwtConfiguration.accessTokenTtl,
            },
        };

        return signInResData;
    }

    async resendVerificationOtp(resendVerificationData: Partial<User>) {
        const email = resendVerificationData.email;

        let user: Partial<User> = null;

        if (email) {
            user = await this.userService.getByEmail(email);
        }

        if (user && user.isVerified) {
            throw new ForbiddenException(ERROR_MESSAGES.CANNOT_GENERATE_OTP);
        } else if (!user) {
            throw new BadRequestException(ERROR_MESSAGES.INVALID_OTP_RESEND_ATTEMPT);
        }
    }

    async signIn(signinData: Partial<User>) {
        let user: Partial<User>;
        if (signinData.email) {
            user = await this.userService.getByEmail(signinData.email);
        }

        if (!user) {
            throw new UnprocessableEntityException(
                ERROR_MESSAGES.INVALID_CREDENTIALS,
            );
        }

        const isValidPassword = await compareHash(signinData.password, user.password);

        const { accessToken, refreshToken } = await this.generateTokens(
            user as User,
        );

        const signInResData = {
            ...user,
            authCredentials: {
                accessToken,
                refreshToken,
                accessTokenTtl: this.jwtConfiguration.accessTokenTtl,
            },
        };

        return signInResData;
    }

    async refreshToken(refreshToken: string) {
        try {
            const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
                Pick<IJwtPayLoadData, 'sub'> & { refreshTokenId: string; }
            >(refreshToken, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });

            const userData = await this.userService.getById(sub);
            const cachedRefreshTokenId = await this.rdbService.getRefreshTokenId(userData.id);

            // JWT Access reuse detection
            if (refreshTokenId !== cachedRefreshTokenId) {
                throw new Error();
            }

            return {
                ...(await this.generateTokens(userData)),
                accessTokenTtl: this.jwtConfiguration.accessTokenTtl,
            };
        } catch {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
    }

    async validatePasswordResetUser(passwordResetData: Partial<User>) {
        let user: Partial<User>;
        if (passwordResetData.email) {
            user = await this.userService.getByEmail(passwordResetData.email);
        }
        if (!user) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
    }

    async resetPassword(data: Partial<User>) {
        const newPassword = await createHash(data.password);
        let user;

        if (data.email) {
            user = await this.userService.getByEmail(data.email);
        }

        if (user.password) {
            const isOldPassword = await compareHash(data.password, user.password);

            if (isOldPassword) {
                throw new ForbiddenException(ERROR_MESSAGES.PLEASE_USE_NEW_PASSWORD);
            }
        }

        data.password = newPassword;

        return true;
    }

    async inAppPasswordReset(data: InAppPasswordResetDto, id: string) {
        const user = await this.userService.getById(id);

        const isOldPassword = await compareHash(data.password, user.password);

        if (isOldPassword) {
            throw new ForbiddenException(ERROR_MESSAGES.PLEASE_USE_NEW_PASSWORD);
        }

        const password = await createHash(data.password);

        await this.userService.update({ password }, undefined, id);
        return true;
    }

    async generateTokens(user: User): Promise<Record<string, string>> {
        const refreshTokenId = randomUUID();

        const [accessToken, refreshToken] = await Promise.all([
            this.authenticationToken<Partial<IJwtPayLoadData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isDeactivated: user.isDeactivated,
                },
            ),
            this.authenticationToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
                refreshTokenId,
            }),
        ]);

        await this.rdbService.storeRefreshTokenId(user.id, refreshTokenId);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async authenticationToken<T>(
        userId: string,
        expiresIn: number,
        payload?: T,
    ) {
        return await this.jwtService.signAsync(
            {
                sub: userId,
                ...payload,
            },
            {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.audience,
                expiresIn,
            },
        );
    }

    async validateUserPassword(id: UUID, password: string) {
        const user = await this.userService.getById(id);
        if (!user.isVerified) {
            throw new ForbiddenException(ERROR_MESSAGES.ACCOUNT_IS_NOT_VERIFIED);
        }

        const isValidPasswd = await compareHash(password, user.password);
        if (!isValidPasswd) {
            throw new UnprocessableEntityException(
                ERROR_MESSAGES.INVALID_CREDENTIALS,
            );
        }
    }
}

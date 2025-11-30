import { randomUUID } from 'crypto';
import { ERROR_MESSAGES } from 'src/enum/responses.enum';
import { IJwtPayLoadData } from 'src/interface';
import { MailService } from 'src/notification/service/mail.service';
import jwtConfig from 'src/utils/config/jwt.config';
import { compareHash, createHash } from 'src/utils/utils';
import { QueryFailedError, Repository } from 'typeorm';

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
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { RdbService } from '../../redisdb/rdb.service';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { ResendUserSignUpOtpDto } from '../dto/resend-user-signup-otp.dto';
import { SignInUserDto } from '../dto/signin-user.dto';
import { VerifyPasswordResetOtpDto } from '../dto/verify-password-reset-otp.dto';
import { VerifyUserSignupDto } from '../dto/verify-user-signup.dto';
import { User } from '../entity/user.entity';
import { UserService } from './user.service';

import type { ConfigType } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        private userService: UserService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly rdbService: RdbService,
        private jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    async signUp(data, otp) {
        try {
            data.password = await createHash(data.password);
            await this.userService.create({ ...data, isAnonymous: false });
            await this.rdbService.storeSignUpOtp(`${data.email}`, otp);
            this.mailService.setEmailOtpMailFormat({ email: data.email, otp });
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

    async verifySignup(data: VerifyUserSignupDto) {
        const cachedData = await this.rdbService.getSignUpOtp(`${data.email}`);

        if (cachedData === null || cachedData !== data.otp) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const verifiedUser = await this.userService.update({ isVerified: true }, data.email);

        await this.rdbService.deleteSignUpOtp(`${data.email}`);

        if (verifiedUser.email) {
            this.mailService.userSignupWelcomeMailFormat({ email: data.email });
        }

        return;
    }

    async resendVerificationOtp(data: ResendUserSignUpOtpDto, otp: string) {
        const email = data.email;

        let user: Partial<User> | null = null;

        if (email) {
            user = await this.userService.getByEmail(email);
        }

        if (user && user.isVerified) {
            throw new ForbiddenException(ERROR_MESSAGES.CANNOT_GENERATE_OTP);
        } else if (!user) {
            throw new BadRequestException(ERROR_MESSAGES.INVALID_OTP_RESEND_ATTEMPT);
        }


        await this.rdbService.storeSignUpOtp(`${data.email}`, otp);
        this.mailService.setEmailOtpMailFormat({ email: data.email, otp });
    }

    async signIn(signinData: SignInUserDto) {
        let user: Partial<User> | null = null;
        if (signinData.email) {
            user = await this.userService.getByEmail(signinData.email);
        }

        if (!user) {
            throw new UnprocessableEntityException(
                ERROR_MESSAGES.INVALID_CREDENTIALS,
            );
        }

        if (!user.isVerified) {
            throw new ForbiddenException(ERROR_MESSAGES.ACCOUNT_IS_NOT_VERIFIED);
        }

        if (!user.password) {
            throw new UnprocessableEntityException(ERROR_MESSAGES.NO_PASSWORD);
        }

        const isValidPassword = await compareHash(signinData.password, user.password);

        if (!isValidPassword) {
            throw new UnprocessableEntityException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const { accessToken, refreshToken } = await this.generateTokens(user as User);

        const signInResData = {
            ...user,
            authCredentials: {
                accessToken, refreshToken, accessTokenTtl: this.jwtConfiguration.accessTokenTtl,
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
            const cachedRefreshTokenId = await this.rdbService.getRefreshTokenId(
                userData.id,
            );

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

    async validatePasswordResetUser(data: Partial<User>, otp: string) {
        let user: Partial<User> | null = null;
        if (data.email) {
            user = await this.userService.getByEmail(data.email);
        }

        await this.rdbService.storePasswordResetOtp(data.email, otp);
        this.mailService.setEmailOtpMailFormat({ email: data.email, otp });

        if (!user) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
    }

    async validatePasswordResetOtp(data: VerifyPasswordResetOtpDto) {
        if (!data.email) {
            throw new BadRequestException(ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED);
        }

        const otp = await this.rdbService.getPasswordResetOtp(data.email);

        if (otp !== data.otp) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        return;
    }

    async resetPassword(data: PasswordResetDto) {
        const cachedData = await this.rdbService.getPasswordResetOtp(data.email);

        if (cachedData === null || cachedData !== data.otp) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        if (!data.password) {
            throw new BadRequestException('Password is required');
        }

        const newPassword = await createHash(data.password);
        let user: Partial<User> | null = null;

        if (data.email) {
            user = await this.userService.getByEmail(data.email);
        }

        if (!user) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        if (user.password) {
            const isOldPassword = await compareHash(data.password, user.password);

            if (isOldPassword) {
                throw new ForbiddenException(ERROR_MESSAGES.PLEASE_USE_NEW_PASSWORD);
            }
        }

        await this.userService.update({ password: newPassword }, data.email);

        await this.rdbService.deletePasswordResetOtp(data.email);

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

    async validateUserPassword(id: string, password: string) {
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

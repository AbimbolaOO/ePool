import { CONSTANTS } from 'src/enum/constants.enum';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from 'src/enum/responses.enum';
import { generateOTP } from 'src/utils/utils';

import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { genPasswdResetOtpDto } from '../dto/gen-passwd-reset-otp.dto';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ResendUserSignUpOtpDto } from '../dto/resend-user-signup-otp.dto';
import { SignInUserDto } from '../dto/signin-user.dto';
import { SignupUserDto } from '../dto/signup-user.dto';
import { VerifyPasswordResetOtpDto } from '../dto/verify-password-reset-otp.dto';
import { VerifyUserSignupDto } from '../dto/verify-user-signup.dto';
import { RdbService } from '../redisdb/rdb.service';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly rdbService: RdbService,
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() body: SignupUserDto) {
        await this.authService.signUp(body);
        const otp: string = generateOTP();


        await this.rdbService.storeSignUpOtp(`${body.email}`, otp);
        // this.notificationClient.emit(CONSTANTS.EMAIL_OTP, { email: body.email, otp });

        return {
            statusCode: HttpStatus.CREATED,
            message: `Account created, check email to verify`,
            data: {
                otp: this.configService.get<string>('DEV_MODE') === 'true' ? otp : null,
            },
        };
    }

    // @serialize(SignUserResDto)
    @Post('signup/verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifySignup(@Body() body: VerifyUserSignupDto) {
        const cachedData = await this.rdbService.getSignUpOtp(
            `${body.email}`,
        );

        if (cachedData === null || cachedData !== body.otp) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const resData = await this.authService.verifySignup(body);

        if (resData.email) {
            // this.notificationClient.emit(CONSTANTS.USER_WELCOME_EMAIL_NOTIFICATION, { email: body.email });
        }

        return {
            statusCode: HttpStatus.OK,
            message: SUCCESS_MESSAGES.SUCCESSFUL_VERIFICATION,
            data: resData,
        };
    }

    @Post('signup/resend-otp')
    @HttpCode(HttpStatus.OK)
    async ResendVerificationOtp(@Body() body: ResendUserSignUpOtpDto) {
        if (!body.email) {
            throw new BadRequestException(
                ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED,
            );
        }

        await this.authService.resendVerificationOtp(body);
        const otp: string = generateOTP();

        if (body.email) {
            await this.rdbService.storeSignUpOtp(`${body.email}`, otp);
            // this.notificationClient.emit(CONSTANTS.EMAIL_OTP, { email: body.email, otp });
        }

        return {
            statusCode: HttpStatus.OK,
            message: SUCCESS_MESSAGES.OTP_RESENT,
            data: {
                otp: this.configService.get<string>('DEV_MODE') === 'true' ? otp : null,
            },
        };
    }

    // @Serialize(SignUserResDto)
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() body: SignInUserDto) {
        if (!body.email) {
            throw new BadRequestException(
                ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED,
            );
        }

        const resData = await this.authService.signIn(body);

        return {
            statusCode: HttpStatus.OK,
            message: SUCCESS_MESSAGES.SIGNIN_SUCCESSFUL,
            data: resData,
        };
    }

    // @Serialize(AuthCredentialsDto)
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() body: RefreshTokenDto) {
        const resData = await this.authService.refreshToken(body.refreshToken);
        return {
            statusCode: HttpStatus.OK,
            message: SUCCESS_MESSAGES.AUTH_CREDENTIALS,
            data: resData,
        };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async genPasswordResetOtp(@Body() body: genPasswdResetOtpDto) {
        if (!body.email) {
            throw new BadRequestException(
                ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED,
            );
        }

        await this.authService.validatePasswordResetUser(body);
        const otp: string = generateOTP();

        if (body.email) {
            await this.rdbService.storePasswordResetOtp(body.email, otp);
            // this.notificationClient.emit(CONSTANTS.EMAIL_PASSWD_RESET_OTP, { email: body.email, otp });
        }

        return {
            statusCode: 200,
            message: `Reset OTP sent, check ${body.email ? 'mail' : 'phone'}`,
            data: {
                otp: this.configService.get<string>('DEV_MODE') === 'true' ? otp : null,
            },
        };
    }

    @Post('verify-reset-password')
    @HttpCode(HttpStatus.OK)
    async validatePasswordResetOtp(@Body() body: VerifyPasswordResetOtpDto) {
        if (!body.email) {
            throw new BadRequestException(
                ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED,
            );
        }

        const otp = await this.rdbService.getPasswordResetOtp(body.email);

        if (otp !== body.otp) {
            throw new UnauthorizedException(
                ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED,
            );
        }

        return {
            statusCode: HttpStatus.OK,
            message: 'OTP is valid',
            data: null,
        };
    }

    @Patch('reset-password')
    @HttpCode(HttpStatus.OK)
    async PasswordReset(@Body() body: PasswordResetDto) {
        if (!body.email) {
            throw new BadRequestException(
                ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED,
            );
        }

        const cachedData = await this.rdbService.getPasswordResetOtp(body.email);
        if (cachedData === null || cachedData !== body.otp) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        await this.authService.resetPassword(body);
        return {
            statusCode: HttpStatus.OK,
            message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESSFULLY,
        };
    }
}

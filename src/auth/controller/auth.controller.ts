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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { MailService } from '../../notification/service/mail.service';
import { RdbService } from '../../redisdb/rdb.service';
import { genPasswdResetOtpDto } from '../dto/gen-passwd-reset-otp.dto';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ResendUserSignUpOtpDto } from '../dto/resend-user-signup-otp.dto';
import { SignInUserDto } from '../dto/signin-user.dto';
import { SignupUserDto } from '../dto/signup-user.dto';
import { VerifyPasswordResetOtpDto } from '../dto/verify-password-reset-otp.dto';
import { VerifyUserSignupDto } from '../dto/verify-user-signup.dto';
import { AuthService } from '../service/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly rdbService: RdbService,
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) {}

    @ApiOperation({
        summary: 'User Registration',
        description: 'Register a new user account. An OTP will be sent to the provided email for verification.'
    })
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() body: SignupUserDto) {
        await this.authService.signUp(body);
        const otp: string = generateOTP();

        await this.rdbService.storeSignUpOtp(`${body.email}`, otp);
        this.mailService.setEmailOtpMailFormat({ email: body.email, otp });

        return {
            statusCode: HttpStatus.CREATED,
            message: `Account created, check email to verify`,
            data: {
                otp: this.configService.get<string>('DEV_MODE') === 'true' ? otp : null,
            },
        };
    }

    @ApiOperation({
        summary: 'Verify User Signup',
        description: 'Verify user email using the OTP sent during registration'
    })
    @Post('signup/verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifySignup(@Body() body: VerifyUserSignupDto) {
        const cachedData = await this.rdbService.getSignUpOtp(`${body.email}`);

        if (cachedData === null || cachedData !== body.otp) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const resData = await this.authService.verifySignup(body);

        await this.rdbService.deleteSignUpOtp(`${body.email}`);

        if (resData.email) {
            this.mailService.userSignupWelcomeMailFormat({ email: body.email });
        }

        return {
            statusCode: HttpStatus.OK,
            message: SUCCESS_MESSAGES.SUCCESSFUL_VERIFICATION,
            data: resData,
        };
    }

    @ApiOperation({
        summary: 'Resend Verification OTP',
        description: 'Resend OTP to user email for account verification'
    })
    @Post('signup/resend-otp')
    @HttpCode(HttpStatus.OK)
    async ResendVerificationOtp(@Body() body: ResendUserSignUpOtpDto) {
        if (!body.email) {
            throw new BadRequestException(ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED);
        }

        await this.authService.resendVerificationOtp(body);
        const otp: string = generateOTP();

        if (body.email) {
            await this.rdbService.storeSignUpOtp(`${body.email}`, otp);
            this.mailService.setEmailOtpMailFormat({ email: body.email, otp });
        }

        return {
            statusCode: HttpStatus.OK,
            message: SUCCESS_MESSAGES.OTP_RESENT,
            data: {
                otp: this.configService.get<string>('DEV_MODE') === 'true' ? otp : null,
            },
        };
    }

    @ApiOperation({
        summary: 'User Sign In',
        description: 'Authenticate user with email and password'
    })
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() body: SignInUserDto) {
        if (!body.email) {
            throw new BadRequestException(ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED);
        }

        const resData = await this.authService.signIn(body);

        return {
            statusCode: HttpStatus.OK,
            message: SUCCESS_MESSAGES.SIGNIN_SUCCESSFUL,
            data: resData,
        };
    }

    @ApiOperation({
        summary: 'Refresh Access Token',
        description: 'Generate a new access token using a valid refresh token'
    })
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

    @ApiOperation({
        summary: 'Generate Password Reset OTP',
        description: 'Generate and send OTP for password reset to user email'
    })
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async genPasswordResetOtp(@Body() body: genPasswdResetOtpDto) {
        if (!body.email) {
            throw new BadRequestException(ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED);
        }

        await this.authService.validatePasswordResetUser(body);
        const otp: string = generateOTP();

        if (body.email) {
            await this.rdbService.storePasswordResetOtp(body.email, otp);
            this.mailService.setEmailOtpMailFormat({ email: body.email, otp });
        }

        return {
            statusCode: HttpStatus.OK,
            message: `Reset OTP sent, check ${body.email ? 'mail' : 'phone'}`,
            data: {
                otp: this.configService.get<string>('DEV_MODE') === 'true' ? otp : null,
            },
        };
    }

    @ApiOperation({
        summary: 'Verify Password Reset OTP',
        description: 'Verify the OTP sent for password reset'
    })
    @Post('verify-reset-password')
    @HttpCode(HttpStatus.OK)
    async validatePasswordResetOtp(@Body() body: VerifyPasswordResetOtpDto) {
        if (!body.email) {
            throw new BadRequestException(ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED);
        }

        const otp = await this.rdbService.getPasswordResetOtp(body.email);

        if (otp !== body.otp) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        return {
            statusCode: HttpStatus.OK,
            message: 'OTP is valid',
            data: null,
        };
    }

    @ApiOperation({
        summary: 'Reset User Password',
        description: 'Reset user password after OTP verification'
    })
    @Patch('reset-password')
    @HttpCode(HttpStatus.OK)
    async PasswordReset(@Body() body: PasswordResetDto) {
        if (!body.email) {
            throw new BadRequestException(ERROR_MESSAGES.EMAIL_MUST_BE_SPECIFIED);
        }

        const cachedData = await this.rdbService.getPasswordResetOtp(body.email);
        if (cachedData === null || cachedData !== body.otp) {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        await this.authService.resetPassword(body);
        await this.rdbService.deletePasswordResetOtp(body.email);

        return {
            statusCode: HttpStatus.OK,
            message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESSFULLY,
        };
    }
}

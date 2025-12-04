import { Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { AuthCredentialsDto } from './auth-credentials.dto';
import { SignInUserResponseDto } from './signin-user-response.dto';

export class SignInResponseDto extends SignInUserResponseDto {
    @ApiProperty({
        description: 'Authentication credentials',
        type: AuthCredentialsDto,
    })
    @Type(() => AuthCredentialsDto)
    @Expose()
    authCredentials: AuthCredentialsDto;
}

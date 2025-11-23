import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ResendUserSignUpOtpDto {
  @ApiProperty({
    description: 'User email address to resend OTP',
    example: 'abimbolaolayemiwhyte@gmail.com',
    format: 'email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @Expose()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
}

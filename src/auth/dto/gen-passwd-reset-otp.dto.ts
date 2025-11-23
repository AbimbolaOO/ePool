import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class genPasswdResetOtpDto {
  @ApiProperty({
    description: 'User email address to send password reset OTP',
    example: 'abimbolaolayemiwhyte@gmai.com',
    format: 'email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
}

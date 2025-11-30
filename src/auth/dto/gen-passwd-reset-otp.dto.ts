import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class genPasswdResetOtpDto {
  @ApiProperty({
    description: 'User email address to send password reset OTP',
    example: 'abimbolaolayemiwhyte@gmail.com',
    format: 'email',
    required: true,
  })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
}

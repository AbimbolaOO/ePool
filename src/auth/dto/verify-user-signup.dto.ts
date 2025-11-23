import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserSignupDto {
  @ApiProperty({
    description: 'User email address',
    example: 'abimbolaolayemiwhyte@gmai.com',
    format: 'email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @Expose()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'One-time password for email verification',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    required: true,
  })
  @IsString()
  @Length(6, 6)
  @Expose()
  otp: string;
}

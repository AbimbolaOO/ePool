import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsStrongPassword, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDto {
  @ApiProperty({
    description: 'User email address',
    example: 'abimbolaolayemiwhyte@gmail.com',
    format: 'email',
    required: true,
  })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'New strong password with at least 8 characters, including uppercase, lowercase, number, and special character',
    example: 'NewWhyte@123',
    minLength: 8,
    required: true,
  })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'One-time password for password reset verification',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    required: true,
  })
  @IsString()
  @Length(6, 6)
  otp: string;
}

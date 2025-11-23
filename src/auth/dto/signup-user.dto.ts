import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class SignupUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'abimbolaolayemiwhyte@gmail.com',
    format: 'email',
    required: false,
  })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  @IsOptional()
  email: string;

  @ApiProperty({
    description: 'Strong password with at least 8 characters, including uppercase, lowercase, number, and special character',
    example: 'Whyte@123',
    minLength: 8,
    required: true,
  })
  @IsString()
  @IsStrongPassword()
  password: string;
}

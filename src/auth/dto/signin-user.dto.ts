import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class SignInUserDto {
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
    description: 'User password',
    example: 'Whyte@123',
    required: true,
  })
  @IsString()
  password: string;
}

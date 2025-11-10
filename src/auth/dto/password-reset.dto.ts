import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class PasswordResetDto {
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

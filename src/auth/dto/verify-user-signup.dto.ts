import { Expose, Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class VerifyUserSignupDto {
  @IsEmail()
  @IsOptional()
  @Expose()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsString()
  @Length(6, 6)
  @Expose()
  otp: string;
}

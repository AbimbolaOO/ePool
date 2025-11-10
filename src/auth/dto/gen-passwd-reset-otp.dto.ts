import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class genPasswdResetOtpDto {
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
}

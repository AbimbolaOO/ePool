import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class ResendUserSignUpOtpDto {
  @IsEmail()
  @IsOptional()
  @Expose()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;
}

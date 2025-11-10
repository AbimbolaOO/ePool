import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SignInUserDto {
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsString()
  password: string;
}

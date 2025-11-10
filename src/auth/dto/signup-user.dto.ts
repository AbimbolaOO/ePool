import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';

export class SignupUserDto {
    @IsEmail()
    @Transform(({ value }) => value?.toLowerCase())
    @IsOptional()
    email: string;

    @IsString()
    @IsStrongPassword()
    password: string;
}

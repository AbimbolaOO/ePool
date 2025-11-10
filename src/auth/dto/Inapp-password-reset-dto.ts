import { IsString, IsStrongPassword } from 'class-validator';

export class InAppPasswordResetDto {
  @IsString()
  @IsStrongPassword()
  password: string;
}

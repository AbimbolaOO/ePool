import { Expose } from 'class-transformer';
import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsJWT()
  @Expose()
  refreshToken: string;
}

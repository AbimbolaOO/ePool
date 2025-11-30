import { Request } from 'express';
import { ERROR_MESSAGES } from 'src/enum/responses.enum';

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      if (payload.refreshTokenId) {
        throw new Error();
      }

      if (payload.isDeactivated) {
        throw new ForbiddenException(
          ERROR_MESSAGES.ACCOUNT_HAS_BEEN_DEACTIVATED,
        );
      }

      if (payload.role) {
        throw new ForbiddenException(ERROR_MESSAGES.YOU_DO_NOT_HAVE_ACCESS);
      }

      request['user'] = payload;
    } catch (err) {
      if (err.message.includes('deactivated')) {
        throw err;
      }
      if (err.message.includes('access')) {
        throw err;
      }
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

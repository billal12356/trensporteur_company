import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = this.extractTokenFromCookies(request);

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_TOKEN,
        });
        request['user'] = payload;
        return true;
      } catch (error) {
        // Token expired or invalid, fall through to refresh token logic
      }
    }

    const refreshToken = request.cookies?.refresh_token;
    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: process.env.JWT_TOKEN,
        });
        
        const newPayload = { sub: payload.sub, role: payload.role };
        const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '15m' });
        
        const isSecure = request.secure || request.headers['x-forwarded-proto'] === 'https';

        response.cookie('jwt', newAccessToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: isSecure ? 'none' : 'lax',
        });
        
        request['user'] = newPayload;
        return true;
      } catch (error) {
        throw new UnauthorizedException('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.');
      }
    }

    throw new UnauthorizedException('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.');
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    return request.cookies?.jwt;
  }
}

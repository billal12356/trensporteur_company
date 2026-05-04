import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookies(request);
    console.log("tokeen" + token);

    if (!token) {
      throw new UnauthorizedException('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT,
      });
      request['user'] = payload;

    } catch {
      throw new UnauthorizedException('🚫 التوكن غير صالح أو منتهي الصلاحية!');
    }
    return true;
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    console.log('cookies' + request.cookies?.jwt);

    return request.cookies?.jwt;
  }
}

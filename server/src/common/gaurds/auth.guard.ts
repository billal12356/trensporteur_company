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
    constructor(private jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromCookies(request); 
      console.log(token);
      
      if (!token) {
        throw new UnauthorizedException('🚫 غير مصرح لك بالدخول، لم يتم العثور على التوكن!');
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
      return request.cookies?.jwt; 
    }
  }
  
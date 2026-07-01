import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ChangeRessetPassword, LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { RessetPasswordDto } from './dto/ressetPassword.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { RateLimitGuard, RateLimit } from 'src/common/gaurds/rate-limit.guard';

@Public()
@Controller('auth')
@UseGuards(RateLimitGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  @RateLimit({ limit: 5, windowMs: 60 * 1000 }) // 5 attempts per minute
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.login(loginDto);
    const payload = { sub: user.data.id, role: user.data.role };

    const access_token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    await this.authService.updateRefreshToken(user.data.id, refresh_token);

    const isSecure = request.secure || request.headers['x-forwarded-proto'] === 'https';

    response.cookie('jwt', access_token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
    });

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
    });

    return {
      user,
      access_token,
      refresh_token,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.authService.validateRefreshToken(payload.sub, refreshToken);
      
      const newPayload = { sub: user.id, role: user.role };
      const access_token = await this.jwtService.signAsync(newPayload, { expiresIn: '15m' });
      
      const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

      res.cookie('jwt', access_token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? 'none' : 'lax',
      });
      return { access_token };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync(refreshToken);
        if (payload && payload.sub) {
          await this.authService.updateRefreshToken(payload.sub, null);
        }
      } catch (e) {
        // ignore invalid token errors on logout
      }
    }
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
    });
    return res.json({ message: 'تم تسجيل الخروج بنجاح' });
  }

  @Post('reset-password')
  @RateLimit({ limit: 3, windowMs: 60 * 1000 }) // 3 attempts per minute
  ressetPassword(@Body() email: RessetPasswordDto) {
    return this.authService.resetPassword(email);
  }

  @Post('verify-code')
  @RateLimit({ limit: 5, windowMs: 60 * 1000 }) // 5 attempts per minute
  async verifyCode(@Body() verifyCode: { email: string; code: number }) {
    return await this.authService.verifyCode(verifyCode);
  }

  @Post('change-password')
  @RateLimit({ limit: 3, windowMs: 60 * 1000 }) // 3 attempts per minute
  async changePassword(@Body() changePasswordData:ChangeRessetPassword){
    return await this.authService.changePassword(changePasswordData)
  }
}


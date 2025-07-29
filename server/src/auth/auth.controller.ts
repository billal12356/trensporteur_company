import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ChangeRessetPassword, LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { RessetPasswordDto } from './dto/ressetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.login(loginDto);
    const payload = { sub: user.data.id, role: user.data.role };

    const access_token = await this.jwtService.signAsync(payload);

    response.cookie('jwt', access_token, {
      httpOnly: true,
      //maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: 'none',
    });

    return {
      user,
      access_token,
    };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.json({ message: 'تم تسجيل الخروج بنجاح' });
  }

  @Post('reset-password')
  ressetPassword(@Body() email: RessetPasswordDto) {
    return this.authService.resetPassword(email);
  }

  @Post('verify-code')
  async verifyCode(@Body() verifyCode: { email: string; code: number }) {
    return await this.authService.verifyCode(verifyCode);
  }

  @Post('change-password')
  async changePassword(@Body() changePasswordData:ChangeRessetPassword){
    return await this.authService.changePassword(changePasswordData)
  }
}

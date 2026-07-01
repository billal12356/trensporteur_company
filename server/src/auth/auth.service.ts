import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ChangeRessetPassword, LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from 'src/users/users.schema';
import { Model } from 'mongoose';
import { ResponseBuilder } from 'src/common/builder/response.builder';
import * as bcrypt from 'bcrypt';
import { RessetPasswordDto } from './dto/ressetPassword.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { createSimpleResetCodeEmail } from 'src/common/email/email-template';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private readonly mailerService: MailerService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersModel.findOne({ email });
    if (!user) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage('البريد الإلكتروني أو كلمة المرور غير صالحة !'),
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage('البريد الإلكتروني أو كلمة المرور غير صالحة !'),
      );
    }

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم إنشاء المستخدم بنجاح')
      .setData(user)
      .build();
  }

  async resetPassword({ email }: RessetPasswordDto) {
    const user = await this.usersModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('هذا المستخدم غير موجود');
    }
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    await this.usersModel.findOneAndUpdate(
      { email },
      {
        verificationCode: code,
        verificationCodeExpiresAt: expiresAt,
      },
    );

    // Use the new simple and perfect email template
    const htmlMessage = createSimpleResetCodeEmail(Number(code), email);

    await this.mailerService.sendMail({
      to: email,
      subject: 'DTW ain defla - Reset Password',
      from: `DTW ain defla <${process.env.EMAIL}>`,
      html: htmlMessage,
    });
    return new ResponseBuilder()
      .setStatus(200)
      .setMessage(`تم إرسال الكود بنجاح إلى بريدك الإلكتروني ${email}`)
      .build();
  }

  async verifyCode({ email, code }: { email: string; code: number }) {
    const user = await this.usersModel
      .findOne({ email })
      .select('verificationCode verificationCodeExpiresAt');

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const now = new Date();
    console.log(user.verificationCodeExpiresAt);
    console.log(now);
    const isExpired = now > user.verificationCodeExpiresAt;
    console.log(isExpired);
    if (isExpired) {
      await this.usersModel.updateOne(
        { email },
        { $unset: { verificationCode: '', verificationCodeExpiresAt: '' } },
      );

      throw new BadRequestException(
        'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد',
      );
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException(
        new ResponseBuilder().setStatus(404).setMessage('رمز التحقق غير صحيح!'),
      );
    }

    await this.usersModel.findOneAndUpdate(
      { email },
      { verificationCode: null, verificationCodeExpiresAt: null },
    );

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم التحقق من الرمز بنجاح، يمكنك الآن تغيير كلمة المرور')
      .build();
  }

  async changePassword(changePasswordData: ChangeRessetPassword) {
    console.log(changePasswordData);
    const user = await this.usersModel.findOne({
      email: changePasswordData.email,
    });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (changePasswordData.password !== changePasswordData.ConfirmePassword) {
      throw new BadRequestException(
        new ResponseBuilder()
          .setStatus(404)
          .setMessage('كلمة السر غير متطابقة !'),
      );
    }

    const password = await bcrypt.hash(changePasswordData.password, 10);

    await this.usersModel.findOneAndUpdate(
      { email: changePasswordData.email },
      { password },
    );

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage('تم تغيير كلمة السر بنجاح.')
      .build();
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    let hashedToken = null;
    if (refreshToken) {
      hashedToken = await bcrypt.hash(refreshToken, 10);
    }
    await this.usersModel.findByIdAndUpdate(userId, {
      refreshToken: hashedToken,
    });
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.usersModel.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Access Denied');
    }
    return user;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ChangeRessetPassword, LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from 'src/users/users.schema';
import { Model } from 'mongoose';
import { ResponseBuilder } from 'src/common/builder/response.builder';
import * as bcrypt from 'bcrypt';
import { RessetPasswordDto } from './dto/ressetPassword.dto';
import { MailerService } from '@nestjs-modules/mailer';

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

    const htmlMessage = `
     <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
            <tr>
                <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="container">
                        <tr>
                            <td>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                                    
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;" class="header">
                                            <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s" alt="شعار الجزائر" style="width: 100%; height: 100%; border-radius: 50%;" />
                                            </div>
                                            <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 24px; font-weight: 700;">مديرية النقل</h1>
                                            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">ولاية عين الدفلة</p>
                                        </td>
                                    </tr>

                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 50px 40px;" class="content">
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <div style="background: #f8fafc; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
                                                    <div style="width: 24px; height: 24px; background: #4f46e5; border-radius: 50%; position: relative;">
                                                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                                                    </div>
                                                </div>
                                                <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 28px; font-weight: 700;">رمز التحقق</h2>
                                                <p style="margin: 0; color: #64748b; font-size: 16px;">تم إرسال رمز التحقق الخاص بك</p>
                                            </div>
                                            
                                            <p style="margin: 0 0 25px 0; color: #374151; font-size: 18px; line-height: 1.7; text-align: center;">
                                                مرحبًا بك! 👋<br>
                                                لقد طلبت رمز تحقق لإعادة تعيين كلمة المرور الخاصة بك
                                            </p>

                                            <!-- Code -->
                                            <div style="text-align: center; padding: 30px 0;">
                                                <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); display: inline-block; padding: 25px 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3); margin: 20px 0;" class="code-container">
                                                    <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">رمز التحقق</p>
                                                    <div style="color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', monospace;" class="code">
                                                        ${code}
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Warning -->
                                            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
                                                <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600;">
                                                    ⏰ هذا الرمز صالح لمدة <strong>10 دقائق فقط</strong>
                                                </p>
                                            </div>

                                            <!-- Security Notice -->
                                            <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                                <h4 style="margin: 0 0 12px 0; color: #dc2626; font-size: 16px; font-weight: 600;">🔒 تنبيه أمني</h4>
                                                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                                                    إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0; text-align: center;" class="footer">
                                            <p style="margin: 0 0 16px 0; color: #64748b; font-size: 16px; font-weight: 600;">مع أطيب التحيات</p>
                                            <p style="margin: 0 0 8px 0; color: #1e293b; font-size: 18px; font-weight: 700;">مديرية النقل لولاية عين الدفلة</p>
                                            <p style="margin: 0; color: #64748b; font-size: 14px;">
                                                📧 ${email}<br>
                                                © 2024 جميع الحقوق محفوظة
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

    `;
    await this.mailerService.sendMail({
      to: email,
      subject: 'DTW ain defla - Resset Password',
      from: `DTW ain defla <${process.env.EMAIL}>`,
      html: htmlMessage,
    });

    return new ResponseBuilder()
      .setStatus(200)
      .setMessage(`تم إرسال الكود بنجاح إلى بريدك الإلكتروني  ${email}`)
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
}

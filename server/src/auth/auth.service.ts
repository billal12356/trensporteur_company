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
    <div style="font-family: 'Cairo', Tahoma, sans-serif; background: #f0f4f8; padding: 20px; direction: rtl;">
  <div style="max-width: 650px; margin: auto; background: #ffffff; padding: 35px 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); border-right: 5px solid #0d6efd;">
    
    <div style="text-align: center; margin-bottom: 25px;">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s" alt="شعار الجزائر" style="width: 60px; margin-bottom: 10px;" />
      <h2 style="margin: 0; color: #0d6efd;">مديرية النقل - ولاية عين الدفلة</h2>
      <p style="margin: 5px 0; color: #555;">رمز التحقق الإلكتروني</p>
    </div>

    <p style="font-size: 16px; color: #333;">مرحبًا،</p>
    <p style="font-size: 16px; color: #333;">لقد طلبت رمز تحقق لتأكيد هويتك. يرجى استخدام الكود التالي خلال 10 دقائق:</p>

    <div style="text-align: center; margin: 35px 0;">
      <div style="display: inline-block; background: #0d6efd; color: white; padding: 18px 35px; font-size: 26px; font-weight: bold; border-radius: 8px; letter-spacing: 4px; box-shadow: 0 3px 10px rgba(13, 110, 253, 0.3);">
        ${code}
      </div>
    </div>

    <p style="font-size: 15px; color: #555;">إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد بأمان.</p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

    <p style="font-size: 14px; color: #888;">مع أطيب التحيات،<br />
    مديرية النقل لولاية عين الدفلة<br />
    📧 ${process.env.EMAIL}</p>
  </div>
</div>



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
        new ResponseBuilder().setStatus(404).setMessage('كلمة السر غير متطابقة !'),
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

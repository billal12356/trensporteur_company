export const createSimpleResetCodeEmail = (code, email = process.env.EMAIL) => {
  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>رمز التحقق</title>
        <style>
            @media only screen and (max-width: 600px) {
                .container { width: 100% !important; }
                .content-padding { padding: 25px 15px !important; }
                .code-box { padding: 15px 25px !important; }
                .code-text { font-size: 28px !important; letter-spacing: 4px !important; }
                .header-padding { padding: 25px 15px !important; }
                .footer-padding { padding: 20px 15px !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f8f9fa; color: #343a40;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
            <tr>
                <td style="padding: 30px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 550px; margin: 0 auto;" class="container">
                        <tr>
                            <td>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
                                    
                                    <!-- Header Section -->
                                    <tr>
                                        <td style="padding: 30px 25px; text-align: center; border-bottom: 1px solid #e9ecef;" class="header-padding">
                                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOT8Kacun1rrtYYQIG2h6Iq-N0s3DdiuoNFQ&s" alt="شعار" style="width: 50px; height: 50px; margin-bottom: 15px; border-radius: 50%;" />
                                            <h1 style="margin: 0; color: #495057; font-size: 22px; font-weight: 600;">مديرية النقل - ولاية عين الدفلة</h1>
                                            <p style="margin: 8px 0 0 0; color: #6c757d; font-size: 15px;">رمز التحقق الإلكتروني</p>
                                        </td>
                                    </tr>

                                    <!-- Content Section -->
                                    <tr>
                                        <td style="padding: 35px 25px;" class="content-padding">
                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                <tr>
                                                    <td style="padding-bottom: 25px;">
                                                        <p style="margin: 0 0 15px 0; color: #343a40; font-size: 16px; line-height: 1.6;">مرحبًا،</p>
                                                        <p style="margin: 0; color: #343a40; font-size: 16px; line-height: 1.6;">
                                                            لقد طلبت رمز تحقق لتأكيد هويتك. يرجى استخدام الكود التالي لإعادة تعيين كلمة المرور الخاصة بك:
                                                        </p>
                                                    </td>
                                                </tr>

                                                <!-- Verification Code -->
                                                <tr>
                                                    <td style="text-align: center; padding: 25px 0;">
                                                        <div style="background-color: #e0f2f7; border: 1px solid #b3e0f2; display: inline-block; padding: 20px 35px; border-radius: 6px;" class="code-box">
                                                            <p style="margin: 0; color: #007bff; font-size: 32px; font-weight: bold; letter-spacing: 6px; font-family: 'Courier New', monospace;" class="code-text">
                                                                ${code}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <!-- Expiration Notice -->
                                                <tr>
                                                    <td style="padding-top: 15px; text-align: center;">
                                                        <p style="margin: 0; color: #dc3545; font-size: 14px; font-weight: 500;">
                                                            ⚠️ هذا الرمز صالح لمدة <strong>10 دقائق فقط</strong>.
                                                        </p>
                                                    </td>
                                                </tr>

                                                <!-- Security Notice -->
                                                <tr>
                                                    <td style="padding-top: 30px;">
                                                        <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                                                            إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد بأمان. لا تشارك هذا الرمز مع أي شخص.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Footer Section -->
                                    <tr>
                                        <td style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;" class="footer-padding">
                                            <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">مع أطيب التحيات،</p>
                                            <p style="margin: 0; color: #495057; font-size: 15px; font-weight: 600;">مديرية النقل لولاية عين الدفلة</p>
                                            <p style="margin: 8px 0 0 0; color: #6c757d; font-size: 13px;">
                                                📧 ${email}<br>
                                                © 2024 جميع الحقوق محفوظة.
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
    </body>
    </html>
  `
}




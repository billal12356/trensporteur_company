import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://trensporteur-company.vercel.app',
    ],
    credentials: true,
  });

  // const seeder = app.get(ImportOperateurService);
  // await seeder.run();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // يحذف الحقول غير الموجودة في DTO
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        // نخصّص شكل رسالة الخطأ
        const messages = errors.map(
          (err) => `${Object.values(err.constraints ?? {}).join(', ')}`,
        );
        return new Error(messages.join(' | '));
      },
    }),
  );
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

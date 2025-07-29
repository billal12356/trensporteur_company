import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { OperateurDtwModule } from './operateur-dtw/operateur-dtw.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ChauffeursModule } from './chauffeurs/chauffeurs.module';
import { StateModule } from './state/state.module';
import { WordModule } from './word/word.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ImportOperateurModule } from './import-operateur/import-operateur.module';
import { ImportOperateurService } from './import-operateur/import-operateur.service';
import { ImportOperateurController } from './import-operateur/import-operateur.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    MailerModule.forRoot({
      transport: {
        service:"gmail",
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS_EMAIL,
        },
      }
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_TOKEN,
    }),
    UsersModule,
    AuthModule,
    OperateurDtwModule,
    VehiclesModule,
    ChauffeursModule,
    StateModule,
    WordModule,
    ImportOperateurModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}

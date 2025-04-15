import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { OperateurDtwModule } from './operateur-dtw/operateur-dtw.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ChauffeursModule } from './chauffeurs/chauffeurs.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_TOKEN
    }),
    UsersModule,
    AuthModule,
    OperateurDtwModule,
    VehiclesModule,
    ChauffeursModule
  ],
})
export class AppModule { }

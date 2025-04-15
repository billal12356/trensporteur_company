import { Module } from '@nestjs/common';
import { OperateurDtwService } from './operateur-dtw.service';
import { OperateurDtwController } from './operateur-dtw.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Operateur, OperateurSchema } from './operateur-dtw.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Operateur.name, schema: OperateurSchema }])],
  controllers: [OperateurDtwController],
  providers: [OperateurDtwService],
  exports:[OperateurDtwService]
})
export class OperateurDtwModule {}

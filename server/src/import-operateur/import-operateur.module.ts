import { Module } from '@nestjs/common';
import { ImportOperateurService } from './import-operateur.service';
import { ImportOperateurController } from './import-operateur.controller';
import { OperateurDtwModule } from 'src/operateur-dtw/operateur-dtw.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Operateur, OperateurSchema } from 'src/operateur-dtw/operateur-dtw.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Operateur.name, schema: OperateurSchema }]),
  ],
  controllers: [ImportOperateurController],
  providers: [ImportOperateurService],
  exports:[ImportOperateurService]
})
export class ImportOperateurModule { }

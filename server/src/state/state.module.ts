import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { StateController } from './state.controller';
import { OperateurDtwModule } from 'src/operateur-dtw/operateur-dtw.module';
import { ChauffeursModule } from 'src/chauffeurs/chauffeurs.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Operateur, OperateurSchema } from 'src/operateur-dtw/operateur-dtw.schema';
import { Chauffeur, ChauffeurSchema } from 'src/chauffeurs/chauffeurs.schema';
import { Vihicles, VihiclesSchema } from 'src/vehicles/vihicles.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Operateur.name, schema: OperateurSchema },
      { name: Chauffeur.name, schema: ChauffeurSchema },
      { name: Vihicles.name, schema: VihiclesSchema },
    ]),
  ],
  controllers: [StateController],
  providers: [StateService],
})
export class StateModule { }

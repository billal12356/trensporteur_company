import { forwardRef, Module } from '@nestjs/common';
import { OperateurDtwService } from './operateur-dtw.service';
import { OperateurDtwController } from './operateur-dtw.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Operateur, OperateurSchema } from './operateur-dtw.schema';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { ChauffeursModule } from 'src/chauffeurs/chauffeurs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Operateur.name, schema: OperateurSchema }]),
    forwardRef(() => VehiclesModule),
    forwardRef(() => ChauffeursModule)
  ],
  controllers: [OperateurDtwController],
  providers: [OperateurDtwService],
  exports:[OperateurDtwService]
})
export class OperateurDtwModule {}

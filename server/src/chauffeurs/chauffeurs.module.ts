import { forwardRef, Module } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';
import { ChauffeursController } from './chauffeurs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chauffeur, ChauffeurSchema } from './chauffeurs.schema';
import { OperateurDtwModule } from 'src/operateur-dtw/operateur-dtw.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chauffeur.name, schema: ChauffeurSchema }]),
    forwardRef(() => OperateurDtwModule), 
    forwardRef(() => VehiclesModule), 
  ],
  controllers: [ChauffeursController],
  providers: [ChauffeursService],
  exports:[ChauffeursService]
})
export class ChauffeursModule {}

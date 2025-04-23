import { forwardRef, Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Vihicles, VihiclesSchema } from './vihicles.schema';
import { OperateurDtwModule } from 'src/operateur-dtw/operateur-dtw.module';
import { ChauffeursModule } from 'src/chauffeurs/chauffeurs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vihicles.name, schema: VihiclesSchema }]),
    forwardRef(() => OperateurDtwModule), 
    forwardRef(() => ChauffeursModule), 
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports:[VehiclesService]
})
export class VehiclesModule {}

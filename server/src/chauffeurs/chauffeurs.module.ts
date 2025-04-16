import { Module } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';
import { ChauffeursController } from './chauffeurs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chauffeur, ChauffeurSchema } from './chauffeurs.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Chauffeur.name, schema: ChauffeurSchema }])],
  controllers: [ChauffeursController],
  providers: [ChauffeursService],
})
export class ChauffeursModule {}

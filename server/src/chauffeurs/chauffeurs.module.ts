import { Module } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';
import { ChauffeursController } from './chauffeurs.controller';

@Module({
  controllers: [ChauffeursController],
  providers: [ChauffeursService],
})
export class ChauffeursModule {}

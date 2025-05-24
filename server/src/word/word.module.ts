import { Module } from '@nestjs/common';
import { WordController } from './word.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from './word.schema';
import { WordService } from './word.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }])],
  controllers: [WordController],
  providers: [WordService],
})
export class WordModule { }

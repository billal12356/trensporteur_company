// src/ocr/word.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Word extends Document {
  @Prop() text: string;       // original OCR word
  @Prop() x: number;
  @Prop() y: number;
  @Prop() width: number;
  @Prop() height: number;
  @Prop() conf: number;
  @Prop() fillValue: string;  // value from your DB to place here
}

export const WordSchema = SchemaFactory.createForClass(Word);

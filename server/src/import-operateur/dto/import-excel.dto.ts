import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ExcelData extends Document {
  @Prop({ type: Object })
  data: any;
}

export const ExcelDataSchema = SchemaFactory.createForClass(ExcelData);

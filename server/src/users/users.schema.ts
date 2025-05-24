
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

@Schema()
export class Users {
  @Prop({
    type:String,
    required:true
  })
  fullName: string;

  @Prop({
    type:String,
    required:true
  })
  email: string;

  @Prop({
    type:String,
    required:true,
    minlength:[3,"min length is 3"]
  })
  password: string;

  @Prop()
  phone : string

  @Prop({
    type:String,
    default:'admin'
  })
  role:string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Operateur' })
  operateur: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chauffeur' })
  chauffeur: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vihicule' })
  vihicule: mongoose.Types.ObjectId;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

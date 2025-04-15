
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
}

export const UsersSchema = SchemaFactory.createForClass(Users);
